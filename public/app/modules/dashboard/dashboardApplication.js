
var dashboard = angular.module('dashboard', ['ui.router', 'ngAnimate','ngMaterial','firebase', 'react']);

dashboard.factory('notification', function($firebaseArray, $firebaseObject) {

    return {
        send: function(message, user) {
            var ref = firebase.database().ref('users/'+user)
            var userDB = $firebaseObject(ref);
            userDB.$loaded().then(function(){
                  userDB.haveNotification = true;
                  userDB.$save().then(function(ref) {

                  }, function(error) {
                      console.log("Error:", error);
                  });
            })

            var ref = firebase.database().ref('notifications/');

            var notificationsList = $firebaseArray(ref);
            notificationsList.$loaded().then(function(){
                var notificationAdd = {'user': user, 'message': message}
                notificationsList.$add(notificationAdd).then(function(ref) {
              });
            });
        }
    }
  });

  dashboard.config(["$stateProvider", function ($stateProvider) {
      $stateProvider.state('app.myaccount', {
          url: '/myaccount',
          templateUrl: 'app/modules/dashboard/views/myaccount.html',
          controller: 'myaccountController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'My Account'
          }
      });

      $stateProvider.state('app.adddefaultcontext', {
          url: '/adddefaultcontext',
          templateUrl: 'app/modules/dashboard/views/adddefaultcontext.html',
          controller: 'adddefaultcontextController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Add Default @Context'
          }
      });

      $stateProvider.state('app.addspecificcontext', {
          url: '/addspecificcontext',
          templateUrl: 'app/modules/dashboard/views/addspecificcontext.html',
          controller: 'addspecificcontextController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Add Specific @Context'
          }
      });

      $stateProvider.state('app.adddefaultgraph', {
          url: '/adddefaultgraph',
          templateUrl: 'app/modules/dashboard/views/adddefaultgraph.html',
          controller: 'adddefaultgraphController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Add Default @Graph'
          }
      });

      $stateProvider.state('app.mycontext', {
          url: '/mycontext',
          templateUrl: 'app/modules/dashboard/views/mycontext.html',
          controller: 'mycontextController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'My @Context'
          }
      });

      $stateProvider.state('app.mygraph', {
          url: '/mygraph',
          templateUrl: 'app/modules/dashboard/views/mygraph.html',
          controller: 'mygraphController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'My @Graph'
          }
      });

      $stateProvider.state('app.addbelonging', {
          url: '/addbelonging',
          templateUrl: 'app/modules/dashboard/views/addbelonging.html',
          controller: 'addbelongingController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Add Device'
          }
      });

      $stateProvider.state('app.mybelongings', {
          url: '/mydevices',
          templateUrl: 'app/modules/dashboard/views/mybelongings.html',
          controller: 'mybelongingsController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'My Devices'
          }
      });

      $stateProvider.state('app.addadditionalproperties', {
          url: '/addadditionalproperties',
          templateUrl: 'app/modules/dashboard/views/addadditionalproperties.html',
          controller: 'addadditionalpropertiesController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Add Additional Properties on Devices/Components'
          }
      });

      $stateProvider.state('app.search', {
          url: '/search',
          templateUrl: 'app/modules/dashboard/views/search.html',
          controller: 'searchController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Search'
          }
      });

      $stateProvider.state('app.digitalenvironment', {
          url: '/digitalenvironment',
          templateUrl: 'app/modules/dashboard/digital_environment/src/main/resources/templates/index.html',
          controller: 'digitalenvironmentController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'IoT Environment Modelling'
          }
      });
 }]);
