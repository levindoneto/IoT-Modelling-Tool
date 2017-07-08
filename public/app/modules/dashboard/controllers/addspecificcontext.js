
dashboard.controller("addspecificcontextController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray','Upload','$timeout','notification',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray, Upload, $timeout, notification) {
      var vm = this;
      var ref = firebase.database().ref('contexts/');
      var modelList = $firebaseArray(ref);
      modelList.$loaded().then(function(){
            console.log("CTX LIST: ", modelList[0]);
            $scope.contexts = modelList;
  });
}]);
