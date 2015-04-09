/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="histogram.d.ts" />
interface IDataScope extends ng.IScope {
    histConfig: ngHist.HistConfig;
    data: Array<number>;
    mv: DataCtrl;
    N: number;
}
declare class DataCtrl {
    private $scope;
    constructor($scope: IDataScope);
    hatDist(n: number): void;
    moreDist(n: number): void;
}
