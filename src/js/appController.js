/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['knockout', 'ojs/ojcorerouter', 'ojs/ojmodulerouter-adapter', 'ojs/ojknockoutrouteradapter', 'ojs/ojurlparamadapter', 'ojs/ojthemeutils', 'ojs/ojmodule-element-utils', 'ojs/ojmoduleanimations', 'ojs/ojarraydataprovider', 'ojs/ojknockouttemplateutils', 'ojs/ojknockout', 'ojs/ojmodule-element'],
  function (ko, CoreRouter, ModuleRouterAdapter, KnockoutRouterAdapter, UrlParamAdapter, ThemeUtils, moduleUtils, ModuleAnimations, ArrayDataProvider, KnockoutTemplateUtils) {
    function ControllerViewModel() {
      var self = this;

      self.KnockoutTemplateUtils = KnockoutTemplateUtils;

      // Handle announcements sent when pages change, for Accessibility.
      self.manner = ko.observable('polite');
      self.message = ko.observable();

      document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);

      function announcementHandler(event) {
        setTimeout(function () {
          self.message(event.detail.message);
          self.manner(event.detail.manner);
        }, 200);
      };

      // Save the theme so we can perform platform specific navigational animations
      var platform = ThemeUtils.getThemeTargetPlatform();

      var navData = [
        { path: '', redirect: 'dashboard' },
        { path: 'dashboard', detail: { label: 'Dashboard', iconClass: 'oj-navigationlist-item-icon icon-stats-bars2' } },
        { path: 'controladora', detail: { label: 'Configurações', iconClass: 'oj-navigationlist-item-icon icon-uniE609' } },
        { path: 'controle-dispositivo', detail: { label: 'Controles', iconClass: 'oj-navigationlist-item-icon icon-uniE607' } },
      ];
      // Router setup
      var router = new CoreRouter(navData, {
        urlAdapter: new UrlParamAdapter()
      });
      router.sync();

      this.moduleAdapter = new ModuleRouterAdapter(router, {
        animationCallback: platform === 'android' ?
          function (animationContext) { return 'fade' }
          : undefined
      });

      this.selection = new KnockoutRouterAdapter(router);

      // Setup the navDataProvider with the routes, excluding the first redirected
      // route.
      this.navDataProvider = new ArrayDataProvider(navData.slice(1), { keyAttributes: "path" });

      // Used by modules to get the current page title and adjust padding
      self.getHeaderModel = function () {
        // Return an object containing the current page title
        // and callback handler
        return {
          pageTitle: self.selection.state().detail.label,
          transitionCompleted: self.adjustContentPadding
        };
      };

      // Method for adjusting the content area top/bottom paddings to avoid overlap with any fixed regions.
      // This method should be called whenever your fixed region height may change.  The application
      // can also adjust content paddings with css classes if the fixed region height is not changing between
      // views.
      self.adjustContentPadding = function () {
        var topElem = document.getElementsByClassName('oj-applayout-fixed-top')[0];
        var contentElem = document.getElementsByClassName('oj-applayout-content')[0];
        var bottomElem = document.getElementsByClassName('oj-applayout-fixed-bottom')[0];

        if (topElem) {
          contentElem.style.paddingTop = topElem.offsetHeight + 'px';
        }
        if (bottomElem) {
          contentElem.style.paddingBottom = bottomElem.offsetHeight + 'px';
        }
        // Add oj-complete marker class to signal that the content area can be unhidden.
        // See the override.css file to see when the content area is hidden.
        contentElem.classList.add('oj-complete');
      }

      /* <<TODO>>
      document.addEventListener('deviceready', function () {
        cordova.plugins.backgroundMode.enable();
        // or
        cordova.plugins.backgroundMode.setEnabled(true);

        var ativo = cordova.plugins.backgroundMode.isActive();
        
        function listenForEvents (event) { 
          alert("Carregando a App Controller" + event);
        }
        cordova.plugins.backgroundMode.on('EVENT', listenForEvents);

      }, false);
      */

      console.log("App Controller: " + cordova);

      document.addEventListener("deviceready", function () {
        console.log("App Controller Device Ready" + cordova);
      }, true);

      window.addEventListener('filePluginIsReady', function () {
        console.log("App Controller File plugin is ready" + cordova);
      }, false);
    }

    return new ControllerViewModel();
  }
);
