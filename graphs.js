/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/d3/d3.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ngGraphs;
(function (ngGraphs) {
    var AxesCtrl = (function () {
        function AxesCtrl($scope) {
            this.$scope = $scope;
            this.autoScale = false;
            // Bits that handle all of the children of the plot
            this.children = [];
            this.drawnElements = [];
            $scope.mv = this;
            // So that the watches in the link function can call for a re-render
            $scope.render = this.render.bind(this);
            // Update the appearance when the config changes
            $scope.$watch('options', $scope.render, true);
            /* We create an apply function (so it can be removed),
             * and force an $apply on resize events, triggering
             * the `$watch`s in the `link` function.
             */
            var apply = function () { $scope.$apply(); };
            window.addEventListener('resize', apply);
        }
        /** The Main drawing function
         */
        AxesCtrl.prototype.render = function () {
            var $scope = this.$scope;
            this.setOptions(this.$scope.options);
            $scope.svg.selectAll('*').remove();
            // Set up the scales
            this.setScales();
            this.drawAxes();
            this.drawChildren();
        };
        /** Set the scales of the plot
         * if the xDomain or yDomain options are set, use them
         * otherwise, determine the values from all the children
         *
         * The xDomain is calculated first, because the yDomain depends on it
         * for most drawable elements.
         */
        AxesCtrl.prototype.setScales = function () {
            // create the actual scales based on the SVG geometry.
            var p = this.padding;
            var w = this.$scope.width - (p[1] + p[3]);
            var h = this.$scope.height - (p[0] + p[2]);
            // XXX autoScale is used to decide whether to re-render the whole thing when a child updates
            this.autoScale = false;
            // Create the xScale
            if (!this.xDomain || this.xDomain[0] == this.xDomain[1]) {
                this.autoScale = true;
                this.xDomain = [0, 0];
                for (var i in this.children) {
                    this.xDomain = this.unionRange(this.xDomain, this.children[i].xRange());
                }
                if (this.xDomain[0] == this.xDomain[1])
                    this.xDomain = [0, 1];
            }
            // XXX xScale is needed to calculate the yScale for histograms
            switch (this.xScaleType) {
                case "log":
                    if (this.xDomain[0] <= 0) {
                        console.warn("xDomain cannot contain any negative numbers for a log-plot");
                        // XXX To even draw something, it must be positive
                        this.xDomain[0] = .000001;
                        if (this.xDomain[1] < this.xDomain[0])
                            this.xDomain[1] = 1;
                    }
                    this.xScale = d3.scale.log();
                    break;
                case "linear":
                default:
                    this.xScale = d3.scale.linear();
            }
            this.xScale.domain(this.xDomain).range([p[3], w + p[3]]);
            // Create the yScale
            if (!this.yDomain || this.yDomain[0] == this.yDomain[1]) {
                this.autoScale = true;
                this.yDomain = [0, 0];
                for (var i in this.children) {
                    // Because the yDomain may depend on the xScale (in histogram), we supply the axes here
                    this.yDomain = this.unionRange(this.yDomain, this.children[i].yRange(this));
                }
                if (this.yDomain[0] == this.yDomain[1])
                    this.yDomain = [0, 1];
            }
            switch (this.yScaleType) {
                case "log":
                    if (this.yDomain[0] <= 0) {
                        console.warn("yDomain cannot contain any negative numbers for a log-plot");
                        // XXX To even draw something, it must be positive
                        this.yDomain[0] = .000001;
                        if (this.yDomain[1] < this.yDomain[0])
                            this.yDomain[1] = 1;
                    }
                    this.yScale = d3.scale.log();
                    break;
                case "linear":
                default:
                    this.yScale = d3.scale.linear();
            }
            this.yScale.domain(this.yDomain).range([h + p[0], p[0]]);
        };
        /** Helper function to get the minimal covering range of two ranges
         *  intervals with same left and right coordinate are considered empty
         */
        AxesCtrl.prototype.unionRange = function (r1, r2) {
            if (r1[0] == r1[1])
                return r2;
            else if (r2[0] == r2[1])
                return r1;
            else
                return [Math.min(r1[0], r2[0]), Math.max(r1[1], r2[1])];
        };
        /** Draw the axes onto the plot
         */
        AxesCtrl.prototype.drawAxes = function () {
            var $scope = this.$scope;
            // Define the axis functions
            var xAxis = d3.svg.axis()
                .scale(this.xScale)
                .ticks(5)
                .orient("bottom");
            var yAxis = d3.svg.axis()
                .scale(this.yScale)
                .ticks(5)
                .orient("left");
            // Draw the axes
            $scope.svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + ($scope.height - this.padding[2]) + ")")
                .call(xAxis)
                .append("text").attr("class", "label")
                .attr("style", "text-anchor:middle")
                .attr("transform", "translate(" + $scope.width / 2 + ", " + (this.padding[2]) + ")")
                .text(this.xLabel || "");
            $scope.svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + this.padding[3] + ",0)")
                .call(yAxis)
                .append("text").attr("class", "label")
                .attr("style", "text-anchor:middle")
                .attr("transform", "translate(" + (-this.padding[3] + 10) + ", " + $scope.height / 2 + "),"
                + "rotate(-90)")
                .text(this.yLabel || "");
            // We want to clip the drawing region.
            var clip = $scope.svg.append("defs").append("clipPath")
                .attr("id", "plotArea")
                .append("rect")
                .attr("id", "clip-rect")
                .attr("x", this.padding[3])
                .attr("y", this.padding[0])
                .attr("width", $scope.width - this.padding[1] - this.padding[3])
                .attr("height", $scope.height - this.padding[0] - this.padding[2]);
            this.drawingRegion = $scope.svg.append("g")
                .attr("clip-path", "url(#plotArea)");
        };
        /** Sets the options for the plot, such as axis locations, range, etc...
         */
        AxesCtrl.prototype.setOptions = function (opts) {
            if (opts) {
                this.xDomain = opts.xDomain;
                this.yDomain = opts.yDomain;
                this.xLabel = opts.xLabel;
                this.yLabel = opts.yLabel;
                this.xScaleType = opts.xScale;
                this.yScaleType = opts.yScale;
                this.padding = opts.padding;
            }
            // Use default values for options that cannot be undefined
            this.xLabel = "";
            this.yLabel = "";
            this.padding = [30, 30, 30, 30]; // top right bottom left
        };
        AxesCtrl.prototype.addChild = function (element) {
            return this.children.push(element) - 1;
        };
        AxesCtrl.prototype.rmChild = function (index) {
            // XXX if we remove the child, we probably also want to undraw it
            this.undrawChild(index);
            delete this.children[index];
        };
        AxesCtrl.prototype.drawChild = function (index) {
            this.undrawChild(index);
            this.drawnElements[index] =
                this.children[index].draw(this.drawingRegion, this.xScale, this.yScale, this);
        };
        AxesCtrl.prototype.reorderElements = function () {
            // Reorder the drawn elements
            var plot = this.drawingRegion[0][0], tmp;
            for (var i in this.drawnElements) {
                tmp = this.drawnElements[i][0];
                for (var j = 0; j < tmp.length; j++) {
                    //plot.removeChild(tmp[j]);
                    plot.appendChild(tmp[j]);
                }
            }
        };
        AxesCtrl.prototype.redrawChild = function (index) {
            if (this.autoScale)
                this.render();
            else {
                this.drawChild(index);
                this.reorderElements();
            }
        };
        AxesCtrl.prototype.drawChildren = function () {
            for (var i in this.children)
                this.drawChild(i);
        };
        AxesCtrl.prototype.undrawChild = function (index) {
            if (this.drawnElements[index]) {
                this.drawnElements[index].remove();
                delete this.drawnElements[index];
            }
        };
        return AxesCtrl;
    }());
    function axesDirective() {
        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                options: '=',
            },
            controller: AxesCtrl,
            link: function (scope, elm, attrs) {
                scope.svg = d3.select(elm[0])
                    .append("svg")
                    .attr("height", '100%')
                    .attr("width", '100%');
                scope.width = elm[0].offsetWidth;
                scope.height = elm[0].offsetHeight;
                scope.$watch(function () {
                    return elm[0].offsetWidth;
                }, function () {
                    scope.width = elm[0].offsetWidth;
                    scope.height = elm[0].offsetHeight;
                    scope.render();
                });
                scope.$watch(function () {
                    return elm[0].offsetHeight;
                }, function () {
                    scope.width = elm[0].offsetWidth;
                    scope.height = elm[0].offsetHeight;
                    scope.render();
                });
            },
            template: '<div ng-transclude></div>',
        };
    }
    ngGraphs.axesDirective = axesDirective;
    var Line = (function () {
        // XXX We may need to add functions to change line data if parts of `l` change.
        function Line(l) {
            this.l = l;
        }
        Line.prototype.draw = function (svg, xScale, yScale) {
            var l = this.l;
            if (l.options) {
                var sw = l.options.strokeWidth;
                var color = l.options.color;
            }
            var start = l.start;
            var end = l.end;
            var drawnLine = svg.append("line")
                .attr("class", "line")
                .attr("x1", xScale(start[0]))
                .attr("y1", yScale(start[1]))
                .attr("x2", xScale(end[0]))
                .attr("y2", yScale(end[1]));
            if (sw)
                drawnLine.style('stroke-width', sw);
            if (color)
                drawnLine.style('stroke', color);
            return drawnLine;
        };
        Line.prototype.xRange = function () {
            return [this.l.start[0], this.l.end[0]];
        };
        Line.prototype.yRange = function () {
            return [this.l.start[1], this.l.end[1]];
        };
        return Line;
    }());
    function lineDirective() {
        return {
            require: '^axes',
            restrict: 'E',
            scope: {
                start: '=',
                end: '=',
                options: '=',
            },
            link: function (scope, element, attrs, axesCtrl) {
                var line = new Line(scope);
                var index = axesCtrl.addChild(line);
                // XXX Currently, there are no watches to handle changes to scope properties
            }
        };
    }
    ngGraphs.lineDirective = lineDirective;
    var Plot = (function () {
        function Plot(plot) {
            this.plot = plot;
            this.initProps(plot);
            this.setData();
        }
        Plot.prototype.initProps = function (plot) { };
        ;
        Plot.prototype.setData = function (axes) {
            this.data = this.plot.data || [];
        };
        Plot.prototype.draw = function (svg, xScale, yScale, axes) {
            // XXX This ends up repeating the version for the line
            // except with different defaults
            if (this.plot.options) {
                var sw = this.plot.options.strokeWidth;
                var color = this.plot.options.color;
            }
            // XXX Probably don't need to recalculate data on every draw.
            // However, this is here to ensure it is actually ready for every draw.
            // e.g. when the axes are resized
            this.setData(axes);
            // This next bit creates an svg path generator
            var pathGen = d3.svg.line()
                .x(function (d) { return xScale(d[0]); })
                .y(function (d) { return yScale(d[1]); })
                .interpolate("linear");
            // Now, the plot is actually added to the svg
            var path = svg.append("path")
                .attr("class", "plot")
                .attr("d", pathGen(this.data))
                .attr("fill", "none");
            if (color)
                path.style("stroke", color);
            if (sw)
                path.style("stroke-width", sw);
            return path;
        };
        Plot.prototype.xRange = function () {
            // TODO re-think when all of this data is being set
            this.setData();
            return [d3.min(this.data, function (d) { return d[0]; }), d3.max(this.data, function (d) { return d[0]; })];
        };
        Plot.prototype.yRange = function (axes) {
            this.setData();
            return [d3.min(this.data, function (d) { return d[1]; }), d3.max(this.data, function (d) { return d[1]; })];
        };
        return Plot;
    }());
    function plotDirective() {
        return {
            restrict: 'E',
            require: '^axes',
            transclude: true,
            scope: {
                options: '=',
                data: '='
            },
            link: function (scope, elm, attrs, axesCtrl) {
                var plot = new Plot(scope);
                var index = axesCtrl.addChild(plot);
                scope.$watch('options', function () {
                    axesCtrl.redrawChild(index);
                }, true);
                scope.$watch('data', function () {
                    axesCtrl.redrawChild(index);
                });
            },
        };
    }
    ngGraphs.plotDirective = plotDirective;
    var Func = (function (_super) {
        __extends(Func, _super);
        function Func(f) {
            _super.call(this, f);
            this.f = f.f;
        }
        Func.prototype.initProps = function (f) {
            this.f = f.f;
        };
        Func.prototype.setData = function (axes) {
            var domain = [0, 1];
            var N = 100; // number of samples
            if (axes) {
                domain = axes.xDomain;
                var range = axes.xScale.range();
                // XXX One point per pixel is plenty
                N = Math.abs(range[0] - range[1]);
            }
            var plotData = Array();
            var i;
            for (i = 0; i <= N; i++) {
                var x = (domain[1] - domain[0]) * i / N + domain[0];
                plotData.push([x, this.f(x)]);
            }
            this.data = plotData;
        };
        Func.prototype.xRange = function () {
            // XXX doesn't make any sense for functions
            return [0, 0];
        };
        Func.prototype.yRange = function (axes) {
            this.setData(axes);
            return [d3.min(this.data, function (d) { return d[1]; }), d3.max(this.data, function (d) { return d[1]; })];
        };
        return Func;
    }(Plot));
    function functionDirective() {
        return {
            restrict: 'E',
            require: "^axes",
            transclude: true,
            scope: {
                options: '=',
                f: '='
            },
            link: function (scope, elm, attrs, axesCtrl) {
                var func = new Func(scope);
                var index = axesCtrl.addChild(func);
                scope.$watch('options', function () {
                    axesCtrl.redrawChild(index);
                }, true);
                scope.$watch('f', function () {
                    axesCtrl.redrawChild(index);
                }, true);
            },
        };
    }
    ngGraphs.functionDirective = functionDirective;
    var Histogram = (function () {
        function Histogram(hist) {
            this.hist = hist;
        }
        Histogram.prototype.setData = function (axes) {
            if (this.hist.options) {
                var bins = this.hist.options.bins;
                var freq = this.hist.options.frequency;
            }
            bins = bins || 10;
            this.data = d3.layout.histogram()
                .frequency(!!freq)
                .range(axes.xDomain)
                .bins(axes.xScale.ticks(bins))(this.hist.data);
        };
        Histogram.prototype.draw = function (svg, xScale, yScale, axes) {
            this.setData(axes);
            var h = svg.append('g').attr("class", "histogram");
            var bar = h.selectAll(".bar")
                .data(this.data).enter().append("g")
                .attr("class", "bar")
                .attr("transform", function (d) {
                return "translate(" + xScale(d.x) + "," +
                    (yScale(d.y) || yScale(yScale.domain()[0])) + ")";
            });
            bar.append("rect").attr("x", 1)
                .attr("width", function (d) { return xScale(d.x + d.dx) - xScale(d.x); })
                .attr("height", function (d) {
                // Because of log scales, we do fancy crap to guarantee no NaN values
                var y0 = yScale(Math.max(yScale.domain()[0], 0));
                var t = y0 - (yScale(d.y) || y0);
                return t;
            });
            return h;
        };
        Histogram.prototype.xRange = function () {
            // TODO return max and min of this.hist.data
            return [0, 0];
        };
        Histogram.prototype.yRange = function (axes) {
            this.setData(axes);
            // TODO return max value of hist[i].y
            return [0, d3.max(this.data, function (d) { return d.y; })];
        };
        return Histogram;
    }());
    function histogramDirective() {
        return {
            restrict: 'E',
            require: "^axes",
            transclude: true,
            scope: {
                options: '=',
                data: '='
            },
            link: function (scope, elm, attrs, axesCtrl) {
                var histogram = new Histogram(scope);
                var index = axesCtrl.addChild(histogram);
                scope.$watch('options', function () {
                    axesCtrl.redrawChild(index);
                }, true);
                scope.$watch('data', function () {
                    axesCtrl.redrawChild(index);
                });
            },
        };
    }
    ngGraphs.histogramDirective = histogramDirective;
    angular.module('ngGraphs', [])
        .directive('axes', axesDirective)
        .directive('line', lineDirective)
        .directive('plot', plotDirective)
        .directive('function', functionDirective)
        .directive('histogram', histogramDirective);
})(ngGraphs || (ngGraphs = {}));
