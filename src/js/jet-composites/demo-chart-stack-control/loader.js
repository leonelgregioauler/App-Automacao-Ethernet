/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
define(['ojs/ojcomposite', 'text!./demo-chart-stack-control-view.html', './demo-chart-stack-control-viewModel', 'text!./component.json', 'css!./demo-chart-stack-control-styles'],
  function(Composite, view, viewModel, metadata) {
    Composite.register('demo-chart-stack-control', {
      view: view,
      viewModel: viewModel,
      metadata: JSON.parse(metadata)
    });
  }
);