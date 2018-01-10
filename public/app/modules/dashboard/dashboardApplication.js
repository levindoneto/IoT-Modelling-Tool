const UNDEFINED = 'undefined';
function routeSyncInit() {
    if (localStorage.getItem('init') === 'false') {
        localStorage.setItem('init', 'true');
        window.location.reload();
    }
}

function routeSync() {
    if (window.localStorage) {
        if (!localStorage.getItem('firstLoad')) {
            localStorage.firstLoad = true;
            window.location.reload();
        } else {
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
        } catch (err) {
            console.log('At least of the used arguments is undefined or has not been processed yet, which is generating the following processing error:\n', err);
            concatenatedStr = concatenatedStr.concat('');
            console.log('The error has been handled successfully, though');
            console.log('All the arguments from this call:\n', theArgs);
        }
    }
    return concatenatedStr;
}

/* Function that, given an object, creates a json file with it
   @Parameters: object: Bbject for conversion, id: string with the name without the date/time info 
   @Return: None, it opens a file for download in a JSON format
*/
function downloadFileJson(object, id, typeElement) {
    try {
        const hyperlinkTag = 'a';
        const d = new Date();
        const h = d.getHours() < 10 ? concatenate('0', d.getHours()) : d.getHours();
        const m = d.getMinutes() < 10 ? concatenate('0', d.getMinutes()) : d.getMinutes();
        const s = d.getSeconds() < 10 ? concatenate('0', d.getSeconds()) : d.getSeconds();
        const fileName = concatenate(id, '_', d.toISOString().substring(0, 10), '_', h, '-', m, '-', s);
        const pom = document.createElement(hyperlinkTag);
        pom.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(object, null, 2))}`);
        pom.setAttribute('download', concatenate(fileName, '.json')); // Open the file for dowloading with the given name 
        if (document.createEvent) {
        const downloadFile = document.createEvent('MouseEvents');
        downloadFile.initEvent('click', true, true); // Event may bubble up through the DOM: true,
                                                    //  Event may be canceled: true 
        pom.dispatchEvent(downloadFile);
        } else {
        pom.click();
        }
    } catch (err) {
        console.log('An error has occurred in the process of creation of the file for the selected ', typeElement);
        console.log('The detail of the error may be seen below\n', err.toString());
        swal({
            title: concatenate('An error has occurred in the process of creation of the file for the selected ', typeElement),
            icon: 'warning',
            button: false,
            timer: 3000
        });
    }
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
              pageTitle: 'IoT Lite @Context'
          }
      });

      $stateProvider.state('app.mygraph', {
          url: '/mygraph',
          templateUrl: 'app/modules/dashboard/views/mygraph.html',
          controller: 'mygraphController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'IoT Lite @Graph'
          }
      });

      $stateProvider.state('app.addbelonging', {
          url: '/addbelonging',
          templateUrl: 'app/modules/dashboard/views/addbelonging.html',
          controller: 'addbelongingController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Add Device or Component'
          }
      });

      $stateProvider.state('app.mybelongings', {
          url: '/mydevices',
          templateUrl: 'app/modules/dashboard/views/mybelongings.html',
          controller: 'mybelongingsController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Devices and Components'
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
