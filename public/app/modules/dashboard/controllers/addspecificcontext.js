
dashboard.controller("addspecificcontextController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray','Upload','$timeout','notification',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray, Upload, $timeout, notification) {
    var vm = this; //controllerAs
    var ref = firebase.database().ref('contexts/');
    var contextList = $firebaseArray(ref);

    /* Loading data from the database */
    contextList.$loaded().then(function(){
          console.log("CTX LIST: ", contextList[0]);
          $scope.contexts = contextList;
    });

    /* Adding data on the database (One property:value on a key per time)
     * context->context_key->new_property = new_property_value
     * On the Front-End: ng-click="addspecificproperty(new_property, new_property_value, context_key)
     */
    $scope.addspecificproperty = function (context_key, new_property, new_property_value) {
        var ref = firebase.database().ref('contexts/'+context_key); // Accessing context->context_key on the database
        let auxObjContext = {}; // Auxiliar to add a key:value on a specific object
        auxObjContext[new_property] = new_property_value; // In this way just a key with a value is added, not a new object
        ref.update(auxObjContext); // Updating the object on the database
        console.log("add the value: ", new_property_value);
    }
    
    /* Function to emulate the for i in range with AngularJS 
     * for (min, max, step) {
     *     do something;
     * }
     */
    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
    return input;
    };
}]);
