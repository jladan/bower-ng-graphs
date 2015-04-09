/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/d3/d3.d.ts" />
declare module ngHist {
    type Range = [number, number];
    interface HistConfig {
        xDomain: Range;
        yDomain?: Range;
        xScale: string;
        yScale: string;
        bins?: number;
    }
}
