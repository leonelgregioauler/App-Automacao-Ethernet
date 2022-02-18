/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['knockout', 
        'appController', 
        'ojs/ojmodule-element-utils', 
        'accUtils',
        '../httpUtil',
        '../dataBase',
        'ojs/ojarraydataprovider',
        'ojs/ojchart',
        'ojs/ojtoolbar',
        'ojs/ojbutton',
        'jet-composites/demo-chart-orientation-control/1.0.0/loader',
        'jet-composites/demo-chart-stack-control/1.0.0/loader'],
 function(ko, app, moduleUtils, accUtils, Util, DataBase, ArrayDataProvider) {

    function DashboardViewModel() {
      var self = this;

      // Header Config
      self.headerConfig = ko.observable({'view':[], 'viewModel':null});
      moduleUtils.createView({'viewPath':'views/header.html'}).then(function(view) {
        self.headerConfig({'view':view, 'viewModel': app.getHeaderModel()})
      })

      let children = [];
      let items = [];      
      self.dataController = ko.observableArray([]);
      self.showGraphic = ko.observable(false);

      self.queryController = async function () {
        let resultControl = await DataBase.queryController('SELECT * FROM CONTROLADORAS');
        let resultSensor  = await DataBase.queryControllerSensor('SELECT * FROM SENSORES_CONTROLADORA');
        
        resultControl.forEach( (item, idx) => {

          //const controller = new AbortController();
        
          Util.callGetService(item.IP, 'statusSensores').then((response) => {
            resultSensor.forEach( (item, idx) => {
              response[idx].nomeSensor = item.nomeSensor;
            });

            children = response;
            items.push({
                      "children": children
                    } );
            self.dataSourceSensores = items;

            const details = self.dataSourceSensores[idx].children.map((item) => {
              return {
                id: item.id,
                series: item.nomeSensor,
                group: `MAC: ${item.ctrl}`,
                value: parseInt(item.cont)
              }
            });
            self.dataSourceSensores[idx].children = new ArrayDataProvider(details); 
            
            if ( (result.length - 1) == idx) {
              self.showGraphic(true);
            }
          }).catch((error, e) => {
            console.log("Erro ao consultar dados do gráfico: " + error + ' ' + e);
            self.showGraphic(true);
          })
        })
      };

      self.stackValue = ko.observable("off");
      self.orientationValue = ko.observable("horizontal");
      self.dataSourceSensores = items;
      
      self.connected = function() {
        accUtils.announce('Dashboard page loaded.', 'assertive');
        document.title = "Dashboard";
        self.queryController();

        const myInterval = setInterval( () => {
          self.showGraphic(false);
          items.splice(-items.length);
          self.queryController();
        }, 60000);
      };

      self.disconnected = function() {
        // Implement if needed
      };

      self.transitionCompleted = function() {
        // Implement if needed
      };
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return DashboardViewModel;
  }
);
