/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/d3/d3.d.ts" />
var ngHist;
(function (ngHist) {
    var HistCtrl = (function () {
        function HistCtrl($scope) {
            var _this = this;
            this.$scope = $scope;
            $scope.mv = this;
            // Things that need to be drawn
            $scope.drawAxes = function () {
                var xAxis = d3.svg.axis().scale(_this.xScale).ticks(5).orient("bottom");
                var yAxis = d3.svg.axis().scale(_this.yScale).ticks(5).orient("left");
                // Draw the axes
                $scope.svg.append("g").attr("class", "axis").attr("transform", "translate(0," + ($scope.height - $scope.padding) + ")").call(xAxis);
                $scope.svg.append("g").attr("class", "axis").attr("transform", "translate(" + $scope.padding + ",0)").call(yAxis);
            };
            $scope.drawHist = function () {
                var chartBody = $scope.svg.append("g").attr("clip-path", "url(#plotArea)");
                // This next bit creates an svg path generator
                var pathGen = d3.svg.line().x(function (d) {
                    return this.xScale(d[0]);
                }).y(function (d) {
                    return this.yScale(d[1]);
                }).interpolate("linear");
                var bar = $scope.svg.selectAll(".bar").data(_this.hdata).enter().append("g").attr("class", "bar").attr("transform", function (d) {
                    return "translate(" + _this.xScale(d.x) + "," + _this.yScale(d.y) + ")";
                });
                bar.append("rect").attr("x", 1).attr("width", function (d) {
                    return _this.xScale(d.x + d.dx) - _this.xScale(d.x);
                }).attr("height", function (d) {
                    return _this.yScale(0) - _this.yScale(d.y);
                });
            };
            $scope.render = function () {
                $scope.svg.selectAll('*').remove();
                var p = $scope.padding;
                var w = $scope.width;
                var h = $scope.height;
                // Set up the scales
                _this.xScale = d3.scale.linear().domain(_this.xDomain).range([p, w - p]);
                _this.yScale = d3.scale.linear().domain([0, d3.max(_this.hdata, function (d) {
                    return d.y;
                })]).range([h - p, p]);
                $scope.drawAxes();
                $scope.drawHist();
            };
            /* The following sets up watches for data, and config
             */
            $scope.$watch('options', function () {
                _this.setOptions($scope.options);
                if (_this.hdata)
                    $scope.render();
            }, true);
            $scope.$watch('data', function () {
                _this.hdata = d3.layout.histogram().range(_this.xDomain).bins(_this.xScale.ticks(_this.bins))($scope.data);
                $scope.render();
            });
            /* We create an apply function (so it can be removed),
             * and force an $apply on resize events, triggering
             * the `$watch`s in the `link` function.
             */
            var apply = function () {
                $scope.$apply();
            };
            window.addEventListener('resize', apply);
        }
        HistCtrl.prototype.setOptions = function (opts) {
            if (opts) {
                this.xDomain = opts.xDomain || [-1, 1];
                this.yDomain = opts.yDomain;
                this.bins = opts.bins || 10;
            }
            else {
                this.xDomain = [-1, 1];
            }
            // The xScale is dependent on config more than data
            var p = this.$scope.padding;
            var w = this.$scope.width;
            this.xScale = d3.scale.linear().domain(this.xDomain).range([p, w - p]);
        };
        return HistCtrl;
    })();
    function histDirective() {
        /* Sets the options for the plot, such as axis locations, range, etc...
         */
        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                options: '=',
                data: '='
            },
            controller: HistCtrl,
            link: function (scope, elm, attrs) {
                // TODO read plot options
                scope.padding = 30;
                scope.svg = d3.select(elm[0]).append("svg").attr("height", '100%').attr("width", '100%');
                scope.width = elm[0].offsetWidth - scope.padding;
                scope.height = elm[0].offsetHeight - scope.padding;
                scope.$watch(function () {
                    return elm[0].offsetWidth;
                }, function () {
                    scope.width = elm[0].offsetWidth - scope.padding;
                    scope.height = elm[0].offsetHeight - scope.padding;
                    scope.render();
                });
                scope.$watch(function () {
                    return elm[0].offsetHeight;
                }, function () {
                    scope.width = elm[0].offsetWidth - scope.padding;
                    scope.height = elm[0].offsetHeight - scope.padding;
                    scope.render();
                });
            },
            template: '<div ng-transclude></div>'
        };
    }
    angular.module('histModule', []).directive('histogram', histDirective);
})(ngHist || (ngHist = {}));
