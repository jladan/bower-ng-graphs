/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/d3/d3.d.ts" />
declare module ngGraphs {
    type Range = [number, number];
    interface AxesConfig {
        xDomain?: Range;
        yDomain?: Range;
        xLabel?: string;
        yLabel?: string;
    }
    function axesDirective(): ng.IDirective;
    function lineDirective(): ng.IDirective;
    function plotDirective(): ng.IDirective;
    function functionDirective(): ng.IDirective;
    interface HistConfig {
        bins?: number;
        frequency?: boolean;
    }
    function histogramDirective(): ng.IDirective;
}
