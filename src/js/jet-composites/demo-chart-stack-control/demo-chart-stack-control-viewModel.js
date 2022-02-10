/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
/* 'use strict';
define(
    ['knockout', 'ojL10n!./resources/nls/demo-chart-stack-control-strings', 'ojs/ojcontext', 'ojs/ojknockout'], function (ko, componentStrings, Context) {
    
    function ExampleComponentModel(context) {
        var self = this;
        
        //At the start of your viewModel constructor
        var busyContext = Context.getContext(context.element).getBusyContext();
        var options = {"description": "Web Component Startup - Waiting for data"};
        self.busyResolve = busyContext.addBusyState(options);

        self.composite = context.element;

        //Example observable
        self.messageText = ko.observable('Hello from demo-chart-stack-control');
        self.properties = context.properties;
        self.res = componentStrings['demo-chart-stack-control'];
        // Example for parsing context properties
        // if (context.properties.name) {
        //     parse the context properties here
        // }

        //Once all startup and async activities have finished, relocate if there are any async activities
        self.busyResolve();
    };
    
    //Lifecycle methods - uncomment and implement if necessary 
    //ExampleComponentModel.prototype.activated = function(context){
    //};

    //ExampleComponentModel.prototype.connected = function(context){
    //};

    //ExampleComponentModel.prototype.bindingsApplied = function(context){
    //};

    //ExampleComponentModel.prototype.disconnected = function(context){
    //};

    //ExampleComponentModel.prototype.propertyChanged = function(context){
    //};

    return ExampleComponentModel;
}); */

define(['knockout', 
        'ojL10n!./resources/nls/demo-chart-stack-control-strings', 
        'ojs/ojcontext', 
        'ojs/ojknockout'
  ], function (ko, componentStrings, Context) {
  function model (context) {
    const res = componentStrings['srt-chart-stack-control'];

    this.unstackedIcon = ko.pureComputed(function() {
      return {
        'oj-ux-ico-chart-area-v': context.properties.type === 'area' || context.properties.type === 'lineWithArea',
        'oj-ux-ico-chart-bar-unstack': context.properties.type === 'bar' || context.properties.type === 'combo'
      }
});
    this.stackedIcon = ko.pureComputed(function() {
      return {
        'oj-ux-ico-chart-area-stack': context.properties.type === 'area' || context.properties.type === 'lineWithArea',
        'oj-ux-ico-chart-bar-stack': context.properties.type === 'bar' || context.properties.type === 'combo'
      }
    });

    const contract = this;
    contract.res = res;
  }
  return model;
})
