define([
  "knockout",
  "appController",
  "ojs/ojmodule-element-utils", 
  "accUtils",
  "ojs/ojcontext",
  "../dataBase",
  "ojs/ojarraydataprovider",
  "ojs/ojknockout-keyset",
  "ojs/ojknockout",
  "ojs/ojinputtext",
  "ojs/ojlabel",
  "ojs/ojbutton",
  "ojs/ojformlayout",
  "ojs/ojmessaging",
  "ojs/ojlistview",
  "ojs/ojlistitemlayout",
  "ojs/ojdialog",
  "ojs/ojselectsingle"
], function (ko, app, moduleUtils, accUtils, Context, DataBase, ArrayDataProvider, keySet) {
  function ControladoraViewModel() {
    var self = this; 

    // Wait until header show up to resolve
    var resolve = Context.getPageContext().getBusyContext().addBusyState({description: "wait for header"});
    // Header Config
    self.headerConfig = ko.observable({'view':[], 'viewModel':null});
    moduleUtils.createView({'viewPath':'views/header.html'}).then(function(view) {
      self.headerConfig({'view':view, 'viewModel': app.getHeaderModel()});
      resolve();
    })

    self.currentIndex;
    self.descricaoControladora = ko.observable('');
    self.IP = ko.observable('');
    self.quantidadeReles = ko.observable('');
    self.quantidadeSensores = ko.observable('');
    self.tipoControladora = ko.observableArray([ {value: 'TRANSMISSORA', label: 'TRANSMISSORA'}, 
                                                 {value: 'RECEPTORA', label: 'RECEPTORA'} ]);
    self.valueControllerType = ko.observable();
    self.valueItemControllerType = ko.observable();

    self.dataController = ko.observableArray([]);
    self.show = ko.observable(false);

    self.queryController = async function () {
      let result = await DataBase.queryController('SELECT * FROM CONTROLADORAS');   
      self.dataController(result);
      self.show(true);
      var items = self.dataController();
      var array = items.map(function(e) {
        return e.idControladora;
      });
      self.lastItemId = Math.max.apply(null, array);
      self.dataProviderController = new ArrayDataProvider(self.dataController, { keyAttributes: "idControladora" } );
    }
    self.dataProviderController = new ArrayDataProvider(self.dataController, { keyAttributes: "idControladora" } );
    
    self.dataProviderControllerType = new ArrayDataProvider(self.tipoControladora(), { keyAttributes: "value" } );
    self.updateSelectedController = function (item) {
      self.tipoControladora(item.detail.value.data);
    };

    self.selectedItems = new keySet.ObservableKeySet();
    
    self.isTextEmpty = ko.observable(true);
    self.isTextAndSelecionFilled = ko.computed(function(){
      return  ( !self.isTextEmpty() && !self.isSelectionEmpty() ) || self.isTextEmpty();
    }, self);

    self.isSelectionEmpty = ko.computed(function () {
      return self.selectedItems().values().size === 0;
    }, self);
    self.isTextOrSelectionEmpty = ko.computed(function () {
      return self.isTextEmpty() || self.isSelectionEmpty();
    }, self);
  
    self.addItem = function () {
      var itemToAdd = self.IP();
      if ((itemToAdd !== '')) {
        DataBase.insertController(self.descricaoControladora(), self.IP(), self.quantidadeReles(), self.quantidadeSensores(), self.tipoControladora().label);
        self.show(false);
        self.queryController();
        self.descricaoControladora('');
        self.IP('');
        self.quantidadeReles('');
        self.quantidadeSensores(''); 
        self.tipoControladora('');
      }
    }.bind(self);
  
    self.updateSelected = function () {
      var itemToReplace = self.dataController()[self.currentIndex];
      self.dataController.splice(self.currentIndex, 1,
        { value: itemToReplace.value, label: self.IP(), idControladora: itemToReplace.idControladora, descricaoControladora: self.descricaoControladora(), IP: self.IP(), quantidadeReles: self.quantidadeReles(), quantidadeSensores: self.quantidadeSensores(), tipoControladora: self.tipoControladora().label });
        DataBase.updateController(itemToReplace.value, self.descricaoControladora(), self.IP(), self.quantidadeReles(), self.quantidadeSensores(), self.tipoControladora().label);
    }.bind(self);
  
    self.close = function(event) {
      document.getElementById("modalDialogExcluirCadastro").close();
    }
    self.open = function(event) {
      document.getElementById("modalDialogExcluirCadastro").open();
    }

    self.removeSelected = function () {
      const items = self.dataController();
      var itemToRemove = self.dataController()[self.currentIndex];
      ControllerLeft = items.filter( (config) => {
        return config.label !== self.IP();
      })
      DataBase.deleteController(itemToRemove.idControladora);
      self.show(false);
      self.queryController();
      self.descricaoControladora('');
      self.IP('');
      self.quantidadeReles('');
      self.quantidadeSensores('');
      self.tipoControladora('');
      self.close();
    }.bind(self);
 
    self.handleCurrentItemChanged = function (event) {
      var key = event.detail.value;
      var items = self.dataController();
      var indice = items.map(function(e) {
        return e.idControladora;
      }).indexOf(key);

      for (var i = 0; i < items.length; i++) { 
        if (i === indice) {
          self.currentIndex = i;
          self.descricaoControladora(items[i].descricaoControladora);
          self.IP(items[i].IP);
          self.quantidadeReles(items[i].quantidadeReles);
          self.quantidadeSensores(items[i].quantidadeSensores);
          self.tipoControladora(items[i].tipoControladora);
          self.valueControllerType(items[i].tipoControladora);
          break;
        }
      }
    }.bind(self);
  
    self.handleRawValueChanged = function (event) {
      var value = event.detail.value;
      self.isTextEmpty(value.trim().length === 0);
    }.bind(self);

    self.connected = function () {
      accUtils.announce("About page loaded.", "assertive");
      document.title = "About";
      //DataBase.dropDataBase();
      DataBase.createDataBase();
      self.queryController();
    };

    self.disconnected = function () {};

    self.transitionCompleted = function () {};
  }

  return ControladoraViewModel;
});
