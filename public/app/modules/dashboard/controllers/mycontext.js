
dashboard.controller("mycontextController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) {
    var vm = this; //controllerAs
    var ref = firebase.database().ref('contexts/'); // Loading all the contexts from the database
    var contextList = $firebaseArray(ref);

    /* Loading data from the database */
    contextList.$loaded().then(function(){
          $scope.contexts = contextList; // scope.context = database->context 
    });
}]);
