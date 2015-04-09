/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="./histogram.ts" />
var DataCtrl = (function () {
    function DataCtrl($scope) {
        this.$scope = $scope;
        // Functions to test out $watch on `data`
        $scope.histConfig = {
            xDomain: [0, 1],
            xScale: 'linear',
            yScale: 'linear'
        };
        $scope.mv = this;
        $scope.N = 100;
        this.hatDist($scope.N);
    }
    DataCtrl.prototype.hatDist = function (n) {
        var i;
        this.$scope.data = new Array(n);
        for (i = 0; i < n; i++) {
            var tmp = Math.random() + Math.random();
            this.$scope.data[i] = tmp / 2;
        }
    };
    DataCtrl.prototype.moreDist = function (n) {
        var i;
        this.$scope.data = new Array(n);
        for (i = 0; i < n; i++) {
            var j, tmp = 0;
            for (j = 0; j < 10; j++)
                tmp += Math.random();
            this.$scope.data[i] = tmp / 10;
        }
    };
    return DataCtrl;
})();
angular.module('histogramApp', ['histModule']).controller('histData', DataCtrl);
