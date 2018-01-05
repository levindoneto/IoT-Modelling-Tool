const UNDEFINED = 'undefined';

function routeSync() {
    if (window.localStorage) {
        if (!localStorage.getItem('firstLoad')) {
            localStorage.firstLoad = true;
            window.location.reload();
        }
        else {
            localStorage.removeItem('firstLoad');
        }
    }
}
/* Function for concatenating strings, even when some of them are empty or undefined
   @Parameters: Unlimited amount of strings
   @Return: String with the concatenation in the following format: str_0+str_1+...str_n
*/
function concatenate(...theArgs) {
    let concatenatedStr = '';
    let s;
    for (s = 0; s < theArgs.length; s++) {
        try { // It just does not work with empty or undefined strings
            concatenatedStr = concatenatedStr.concat((theArgs[s]).toString());
        }
        catch(err) {
            console.log('At least of the used arguments is undefined or has not been processed yet, which is generating the following processing error:\n', err);
            concatenatedStr = concatenatedStr.concat('');
            console.log('The error has been handled successfully, though');
            console.log('All the arguments from this call:\n', theArgs);
        }
    }
    return concatenatedStr;
}

/* Function that resets information from the saved models */
function resetInfoSavedModels() {
    const refInfo = firebase.database().ref('infoSavedModels');
    const auxInfoSaved = {};
    auxInfoSaved.lastLoadedModel = UNDEFINED;
    auxInfoSaved.lastSavedModel = UNDEFINED;
    refInfo.update(auxInfoSaved); // Updating the object on the database
}

var dashboard = angular.module('dashboard', ['ui.router', 'ngAnimate', 'ngMaterial', 'firebase', 'react']);

dashboard.factory('notification', ($firebaseArray, $firebaseObject) => ({
        send: function(message, user) {
            var ref = firebase.database().ref(`users/${user}`);
            var userDB = $firebaseObject(ref);
            userDB.$loaded().then(() => {
                  userDB.haveNotification = true;
                  userDB.$save().then((ref) => {
                  }, (error) => {
                      console.log('Error:', error);
                  });
            });
        }
    }));

  dashboard.config(['$stateProvider', function ($stateProvider) {
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
          controller: 'searchController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'IoT Modelling Environment'
          }
      });
 }]);
