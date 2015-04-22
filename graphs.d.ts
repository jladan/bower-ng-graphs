/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/d3/d3.d.ts" />
declare module ngGraphs {
    function axesDirective(): ng.IDirective;
    function lineDirective(): ng.IDirective;
    function plotDirective(): ng.IDirective;
    function functionDirective(): ng.IDirective;
    function histogramDirective(): ng.IDirective;
}
