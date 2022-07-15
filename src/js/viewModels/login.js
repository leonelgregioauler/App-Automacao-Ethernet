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
define([
  "knockout",
  "appController",
  "ojs/ojmodule-element-utils",
  "accUtils",
  "ojs/ojcontext",
  "../fireBase",
  "ojs/ojknockout",
  "ojs/ojinputtext",
  "ojs/ojlabel",
  "ojs/ojbutton",
  "ojs/ojformlayout",
  "ojs/ojmessaging",
  "ojs/ojmessages"
], function (ko, app, moduleUtils, accUtils, Context, FireBase) {
  function LoginViewModel() {
    
    var self = this;


    // Wait until header show up to resolve
    var resolve = Context.getPageContext().getBusyContext().addBusyState({ description: "wait for header" });
    // Header Config
    self.headerConfig = ko.observable({ 'view': [], 'viewModel': null });
    moduleUtils.createView({ 'viewPath': "views/header.html" }).then(function (view) {
        self.headerConfig({ 'view': view, 'viewModel': app.getHeaderModel() });
        resolve();
      });

    self.nomeUsuario = ko.observable();
    self.senhaUsuario = ko.observable();

    self.handleNewAccount = function () {
      
      FireBase.firebase.auth()
      .createUserWithEmailAndPassword(self.nomeUsuario(), self.senhaUsuario())
      .then( () => {
        alert("Conta Cadastrada com Sucesso !!!");
      })
    }

    self.handleSignIn = function () { 

      FireBase.firebase.auth()
      .signInWithEmailAndPassword(self.nomeUsuario(), self.senhaUsuario())
      .then(() => {
        alert("Usuário conectou com sucesso !!!");
      })
      .catch(() => {
        alert("Usuário ou Senha incorretos !!!");
      })
    }

    self.handleForgotPassword = function () {

      FireBase.firebase.auth()
      .sendPasswordResetEmail(self.nomeUsuario())
      .then(() => {
        alert("Redefinir senha", "Enviamos e-mail para você");
      })
      .catch((error) => {
        console.log(error);
      })
    }

    self.handleSignOut = function() {
      FireBase.firebase.auth()
      .signOut()
      .then(() => {
        alert("Saiu");
      })
    }

    const subscriber = FireBase.firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const uid = user.uid;
      } else {
        console.log('sei lá');
      }
    });
    
    self.connected = function () {
      accUtils.announce("About page loaded.", "assertive");
      document.title = "About";
    };

    self.disconnected = function () {
      // Implement if needed
    };

    self.transitionCompleted = function () {
      // Implement if needed
    };
  }
  return LoginViewModel;
});
