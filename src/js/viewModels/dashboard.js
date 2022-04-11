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

      self.stackValue = ko.observable("off");
      self.orientationValue = ko.observable("horizontal");
      self.lineTypeValue = ko.observable("curved");
      self.labelPosition = ko.observable("none");
      
      let children = [];
      let childrenLog = [];
      
      let items = [];  
      let itemsLog = [];  
      
      let dataLog = [];   
      self.dataController = ko.observableArray([]);
      self.showGraphic = ko.observable(false);
      self.showGraphicLog = ko.observable(false);

      self.queryController = async function () {
        let resultControl = await DataBase.queryController('SELECT * FROM CONTROLADORAS');
        let resultSensor  = await DataBase.queryControllerSensor('SELECT * FROM SENSORES_CONTROLADORA');

        resultControl.forEach( (itemControl, idx) => {

          //const controller = new AbortController();
        
          Util.callGetService(itemControl.IP, 'statusSensores').then((response) => {
            
            let sensores = [];
            
            resultSensor.forEach( (itemSensor, idx) => {
              sensores.push({
                idSensorControladora : itemSensor.idSensorControladora,
                nomeSensor : itemSensor.nomeSensor,
                contadorSensor : response[idx].cont
              });
            });
            
            dataLog.push({
              idControladora : itemControl.idControladora,
              numeroMac : response[0].ctrl,
              sensores : sensores
            });

            DataBase.initializeLogTriggering(dataLog);
            DataBase.updateLogTriggeringSensor(dataLog);
            
            children = response;
            items.push({
                      "children": children
                    } );
            self.dataSourceSensores = items;

            const details = self.dataSourceSensores[idx].children.map((item, idx) => {
              return {
                id: item.id,
                series: sensores[idx].nomeSensor,
                group: `MAC: ${item.ctrl}`,
                value: parseInt(item.cont)
              }
            });
            self.dataSourceSensores[idx].children = new ArrayDataProvider(details); 
            
            if ( (result.length - 1) == idx) {
              self.showGraphic(true);
              //self.showGraphicLog(true);
            }
          }).catch((error, e) => {
            console.log("Erro ao consultar dados do gráfico: " + error + ' ' + e);
            self.showGraphic(true);
          })
        })
      };

      self.queryLogSensor = async function () {
        const date = new Date();
        const dataRegistro = date.toLocaleDateString('pr-br');
        let dataChart = [];
        
        DataBase.queryLogTriggeringSensor(`SELECT * FROM LOG_ACIONAMENTOS L, LOG_ACIONAMENTOS_SENSORES LS, SENSORES_CONTROLADORA SC WHERE SC.idSensorControladora = LS.idSensorControladora AND LS.idLogAcionamento = L.idLogAcionamento AND L.dataRegistro = \'${dataRegistro}\'`).then( (resultLog) => {
        
          resultLog.forEach( async (item, idx) => {
            
            dataChart.push({
              id: item.idLogAcionamentoSensor,
              series: item.nomeSensor,
              value: item.contadorSensor,
              group: item.horaRegistro
            });
          })
        })

        let resultControlLog = await DataBase.queryController('SELECT * FROM CONTROLADORAS');

        resultControlLog.forEach( (itemControl, idx) => {
          childrenLog = dataChart;
          itemsLog.push({
                    "children": childrenLog
                  } );
          self.dataSourceLogSensores = itemsLog;
          self.dataSourceLogSensores[idx].children = new ArrayDataProvider(childrenLog);
          
          if ( (childrenLog.length - 1) == 119) {
            self.showGraphicLog(true);
          }
        })
      }

      /* self.stackValue = ko.observable("off");
      self.orientationValue = ko.observable("horizontal"); */
      self.dataSourceSensores = items;
      self.dataSourceLogSensores = itemsLog;

      
      self.connected = function() {
        accUtils.announce('Dashboard page loaded.', 'assertive');
        document.title = "Dashboard";
        self.queryController();
        self.queryLogSensor();
        
        const myInterval = setInterval( () => {
          self.showGraphic(false);
          items.splice(-items.length);
          self.queryController();
          self.queryLogSensor();
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
