define([
  "knockout",
  "appController",
  "ojs/ojmodule-element-utils", 
  "accUtils",
  "ojs/ojcontext",
  "../dataBase",
  "ojs/ojarraydataprovider",
  "../httpUtil",
  "ojs/ojknockout",
  "ojs/ojinputtext",
  "ojs/ojinputnumber",
  "ojs/ojlabel",
  "ojs/ojbutton",
  "ojs/ojformlayout",
  "ojs/ojmessaging",
  "ojs/ojlistview",
  "ojs/ojlistitemlayout",
  "ojs/ojdialog",
  "ojs/ojselectsingle",
  "ojs/ojtable",
  "ojs/ojavatar",
  "ojs/ojswitch"
], function (ko, app, moduleUtils, accUtils, Context, DataBase, ArrayDataProvider, Util) {
  function ControleViewModel() {
    var self = this; 

    // Wait until header show up to resolve
    var resolve = Context.getPageContext().getBusyContext().addBusyState({description: "wait for header"});
    // Header Config
    self.headerConfig = ko.observable({'view':[], 'viewModel':null});
    moduleUtils.createView({'viewPath':'views/header.html'}).then(function(view) {
      self.headerConfig({'view':view, 'viewModel': app.getHeaderModel()});
      resolve();
    })

    self.dataController = ko.observableArray([]);
    self.dataControllerRelay = ko.observableArray([]);
    self.dataControllerSensor = ko.observableArray([]);

    self.valueControllerType = ko.observable();
    self.valueItemControllerType = ko.observable();
    self.showRelay = ko.observable(false);
    self.showSensor = ko.observable(false);

    self.controladora = ko.observable();
    self.idControladora = ko.observable();
    
    self.idReleControladora = ko.observable();
    self.nomeRele = ko.observable();
    self.comandoLigar = ko.observable(); 
    self.comandoDesligar = ko.observable();
    self.temporizador = ko.observable();
    self.statusTemporizador = ko.observable();
    self.contadorTemporizador = ko.observable();
    
    self.idSensorControladora = ko.observable();
    self.nomeSensor = ko.observable();
    self.contadorSensor = ko.observable();
    self.comandoLer = ko.observable(); 
    self.comandoResetar = ko.observable();

    self.queryController = async function () {
      let result = await DataBase.queryController('SELECT * FROM CONTROLADORAS');
      self.dataController(result);
    };
    self.dataProviderController = new ArrayDataProvider(self.dataController, { keyAttributes: "idControladora" } );
    
    self.updateSelectedController = function (item) {
      self.showRelay(false);
      self.showSensor(false);
      if (item.detail.value.data) {
        self.controladora(item.detail.value.data);
        self.queryControllerRelay();
        self.queryControllerSensor();
      }
    };

    // Relés
    self.queryControllerRelay = async function () {
      let result = await DataBase.queryControllerRelay(`SELECT * FROM RELES_CONTROLADORA WHERE idControladora = ${self.controladora().idControladora}`);
      
      Util.callGetService(self.controladora().IP, 'statusReles').then( (response, reject) => {
        result[0].statusRele = response[0].r1;
        result[1].statusRele = response[1].r2;
        result[2].statusRele = response[2].r3;
        result[3].statusRele = response[3].r4;
        result[4].statusRele = response[4].r5;
        result[5].statusRele = response[5].r6;
        result[6].statusRele = response[6].r7;
        result[7].statusRele = response[7].r8;  

        result[0].isControllerActive = result[0].statusRele == 1 ? true : false;
        result[1].isControllerActive = result[1].statusRele == 1 ? true : false;
        result[2].isControllerActive = result[2].statusRele == 1 ? true : false;
        result[3].isControllerActive = result[3].statusRele == 1 ? true : false;
        result[4].isControllerActive = result[4].statusRele == 1 ? true : false;
        result[5].isControllerActive = result[5].statusRele == 1 ? true : false;
        result[6].isControllerActive = result[6].statusRele == 1 ? true : false;
        result[7].isControllerActive = result[7].statusRele == 1 ? true : false;
        
        self.dataControllerRelay(result);
        self.showRelay(true);
        
        
      }).catch((error, e) => {
        console.log("Erro ao consultar dados dos sensores: " + error + ' ' + e);
      })
    };
    self.dataProviderRelay = new ArrayDataProvider(self.dataControllerRelay , {keyAttributes: "idReleControladora"} );

    self.columnArrayRelay = ko.observableArray([
      { headerText: "Ações", field: "idReleControladora", headerStyle: "text-align: center", width: "50", style: "text-align: center", template: "cellTemplate", class: "oj-helper-text-align-center"},
      { headerText: "Nome do Relé", field: "nomeRele", headerStyle: "text-align: center", width: "80", style: "text-align: center"},
      { headerText: "Ligar / Desligar", field: "isControllerActive", headerStyle: "text-align: center", width: "60", template: "switchTemplate"}
    ]);

    self.selectedChangedListenerRelay = function (event) {
      const row = event.detail.value.row;
      if (row.values().size > 0) {
        row.values().forEach(function (key) {
          var selectedRow = self.dataControllerRelay().find(s => s.idReleControladora === key);
          self.idReleControladora(key);
          self.idControladora(selectedRow.idControladora);
          self.nomeRele(selectedRow.nomeRele);
          self.comandoLigar(selectedRow.comandoLigar);
          self.comandoDesligar(selectedRow.comandoDesligar);
          self.temporizador(selectedRow.temporizador);
          self.statusTemporizador((selectedRow.statusTemporizador == 1 ? true : false));
        });
      }
    };

    self.onOffRelay = function (value, event) {
      if ( (event) && (event.type == 'valueChanged') ) {
        let status = value.isControllerActive ? false : true;
        let temporizador = value.temporizador;
        let statusTemporizador = value.statusTemporizador;

        value.isControllerActive = status;
        
        if (status == true) {
          self.comandoLigar(value.comandoLigar);
          self.activeRelay().then( () => {
            if (statusTemporizador) {
              self.contadorTemporizador(temporizador);
              document.getElementById("modalDialogTemporizador").open();

              let contador = setInterval( () => {
                temporizador--;
                self.contadorTemporizador(temporizador);
              }, 1000);

              setTimeout( () => {
                self.comandoDesligar(value.comandoDesligar);
                self.disableRelay();
                document.getElementById("modalDialogTemporizador").close();
                self.showRelay(false);
                self.queryControllerRelay();
                clearInterval(contador);
              }, temporizador * 1000);
            }
          })
        } else if (status == false) {
          self.comandoDesligar(value.comandoDesligar);
          self.disableRelay();
        }
        return status;
      } else {
        return value.isControllerActive;
      }    
    }

    // Sensores
    self.queryControllerSensor = async function () {
      let result = await DataBase.queryControllerSensor(`SELECT * FROM SENSORES_CONTROLADORA WHERE idControladora = ${self.controladora().idControladora}`);
      
      Util.callGetService(self.controladora().IP, 'statusSensores').then( (response, reject) => {
        response.forEach( (item, idx) => {
          result[idx].contadorSensor = item.cont;
        })
        self.dataControllerSensor(result);
        self.showSensor(true);
      }).catch((error, e) => {
        console.log("Erro ao consultar dados dos sensores: " + error + ' ' + e);
      })
    };
    self.dataProviderSensor = new ArrayDataProvider(self.dataControllerSensor , {keyAttributes: "idSensorControladora"} );

    self.columnArraySensor = ko.observableArray([
      { headerText: "Ações", field: "idSensorControladora", headerStyle: "text-align: center", width: "50", style: "text-align: center", template: "cellTemplate", class: "oj-helper-text-align-center"},
      { headerText: "Nome do Sensor", field: "nomeSensor", headerStyle: "text-align: center", width: "100", style: "text-align: center"},
      { headerText: "Contador", field: "contadorSensor", headerStyle: "text-align: center", width: "80", style: "text-align: center"},
      { headerText: "Resetar", headerStyle: "text-align: center", width: "40", style: "text-align: center", template: "resetTemplate", class: "oj-helper-text-align-center"}
    ]);

    self.selectedChangedListenerSensor = function (event) {
      const row = event.detail.value.row;
      if (row.values().size > 0) {
        row.values().forEach(function (key) {
          var selectedRow = self.dataControllerSensor().find(s => s.idSensorControladora === key);
          self.idSensorControladora(key);
          self.idControladora(selectedRow.idControladora);
          self.nomeSensor(selectedRow.nomeSensor);
          self.comandoLer(selectedRow.comandoLer);
          self.comandoResetar(selectedRow.comandoResetar);
        });
      }
    };

    self.openUpdateRelay = function() {
      document.getElementById("modalDialogAtualizarRele").open();
    }

    self.openUpdateSensor = function() {
      document.getElementById("modalDialogAtualizarSensor").open();
    }

    self.openResetSensor = function () {
      document.getElementById("modalDialogResetarSensor").open();
    }

    self.updateRelay = function() {
      DataBase.updateControllerRelay(self.idReleControladora(), self.nomeRele(), self.comandoLigar(), self.comandoDesligar(), self.temporizador(), self.statusTemporizador() == true ? 1 : 0);
      document.getElementById("modalDialogAtualizarRele").close();
      self.showRelay(false);
      self.queryControllerRelay();
    }

    self.cancelUpdateRelay = function() {
      document.getElementById("modalDialogAtualizarRele").close();
    }

    self.updateSensor = function() {
      DataBase.updateControllerSensor(self.idSensorControladora(), self.nomeSensor(), self.comandoLer(), self.comandoResetar());
      document.getElementById("modalDialogAtualizarSensor").close();
      self.showSensor(false);
      self.queryControllerSensor();
    }

    self.cancelUpdateSensor = function() {
      document.getElementById("modalDialogAtualizarSensor").close();
    }

    self.activeRelay = async function() {
      Util.callGetService(self.controladora().IP, self.comandoLigar());
    }

    self.disableRelay = function() {
      Util.callGetService(self.controladora().IP, self.comandoDesligar());
    }

    self.readSensor = function() {
      self.queryControllerSensor();
    }
    
    self.resetSensor = function() {
      Util.callGetService(self.controladora().IP, self.comandoResetar());
      document.getElementById("modalDialogResetarSensor").close();
      self.showSensor(false);
      self.queryControllerSensor();
    }

    self.cancelResetSensor = function() {
      document.getElementById("modalDialogResetarSensor").close();
    }
    
    /* <<TODO>> 
    cordova.plugins.backgroundMode.moveToForeground();
    cordova.plugins.backgroundMode.on('EVENT', listenForEvents);
    var ativo = cordova.plugins.backgroundMode.isActive();
    alert("Move to Foreground: " + ativo); 
    */
    /* <<TODO>> 
    cordova.plugins.backgroundMode.moveToBackground();
    cordova.plugins.backgroundMode.on('EVENT', listenForEvents);
    var ativo = cordova.plugins.backgroundMode.isActive();
    alert("Move to Background: " + ativo); 
    */
    function listenForEvents (event) { 
      alert("Testando ... <<TODO>>" + event);
    }
    
    /* <<TODO>>
    document.addEventListener('deviceready', function () {
      cordova.plugins.backgroundMode.enable();
      // or
      cordova.plugins.backgroundMode.setEnabled(true)
    }, false);
    */

    self.connected = function () {
      accUtils.announce("About page loaded.", "assertive");
      document.title = "About";
      self.queryController();
    };

    self.disconnected = function () {};

    self.transitionCompleted = function () {};
  }

  return ControleViewModel;
});
