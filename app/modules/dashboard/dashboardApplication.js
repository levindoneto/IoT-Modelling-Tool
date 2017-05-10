
var dashboard = angular.module('dashboard', ['ui.router', 'ngAnimate','ngMaterial','firebase']);

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


  $stateProvider.state('app.mymodels', {
    url: '/mymodels',
    templateUrl: 'app/modules/dashboard/views/mymodels.html',
    controller: 'mymodelsController',
    controllerAs: 'vm',
    data: {
      pageTitle: 'Meus models'
    }
  });

  $stateProvider.state('app.addmodel', {
    url: '/addmodel',
    templateUrl: 'app/modules/dashboard/views/addmodel.html',
    controller: 'addmodelController',
    controllerAs: 'vm',
    data: {
      pageTitle: 'Adicionar model'
    }
  });

  $stateProvider.state('app.wishlist', {
    url: '/wishlist',
    templateUrl: 'app/modules/dashboard/views/wishlist.html',
    controller: 'wishlistController',
    controllerAs: 'vm',
    data: {
      pageTitle: 'Lista de Desejos'
    }
  });

  $stateProvider.state('app.admin', {
    url: '/admin',
    templateUrl: 'app/modules/dashboard/views/admin.html',
    controller: 'adminController',
    controllerAs: 'vm',
    data: {
      pageTitle: 'Administrator'
    }
  });

  $stateProvider.state('app.search', {
    url: '/search',
    templateUrl: 'app/modules/dashboard/views/search.html',
    controller: 'searchController',
    controllerAs: 'vm',
    data: {
      pageTitle: 'Search Model'
    }
  });

  $stateProvider.state('app.trades', {
    url: '/trades',
    templateUrl: 'app/modules/dashboard/views/digitalenvironment.html',
    controller: 'tradesController',
    controllerAs: 'vm',
    data: {
      pageTitle: 'Trocas'
    }
  });



}]);
