/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/d3/d3.d.ts" />
/// <reference path="./plot.ts" />
var DataCtrl = (function () {
    function DataCtrl($scope) {
        this.$scope = $scope;
        // Functions to test out $watch on `data`
        $scope.chooseSine = function (samples) {
            var plotData = Array();
            var N = samples || 100;
            var i;
            for (i = 0; i <= N; i++) {
                var x = 12 * i / N - 6;
                plotData.push([x, Math.sin(x)]);
            }
            $scope.data = plotData;
        };
        $scope.chooseCosine = function (samples) {
            var plotData = Array();
            var N = samples || 100;
            var i;
            for (i = 0; i <= N; i++) {
                var x = 12 * i / N - 6;
                plotData.push([x, Math.cos(x)]);
            }
            $scope.data = plotData;
        };
        $scope.chooseSine();
        $scope.plotConfig = {
            xDomain: [-6, 6],
            yDomain: [-1, 1]
        };
    }
    return DataCtrl;
})();
angular.module('plottingApp', ['plotModule']).controller('plotData', DataCtrl);
