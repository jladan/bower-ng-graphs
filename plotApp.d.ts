/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/d3/d3.d.ts" />
/// <reference path="plot.d.ts" />
interface IDataScope extends ng.IScope {
    chooseSine(samples?: number): any;
    chooseCosine(samples?: number): any;
    plotConfig: any;
    data: Array<[number, number]>;
}
declare class DataCtrl {
    private $scope;
    constructor($scope: IDataScope);
}
