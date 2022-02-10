/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
define(['ojs/ojcomposite', 'text!./demo-chart-orientation-control-view.html', './demo-chart-orientation-control-viewModel', 'text!./component.json', 'css!./demo-chart-orientation-control-styles', 'ojs/ojbutton'],
  function(Composite, view, viewModel, metadata) {
    Composite.register('demo-chart-orientation-control', {
      view: view,
      viewModel: viewModel,
      metadata: JSON.parse(metadata)
    });
  }
);