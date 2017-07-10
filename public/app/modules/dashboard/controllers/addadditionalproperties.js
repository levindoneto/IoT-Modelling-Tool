
dashboard.controller("addadditionalpropertiesController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray','Upload','$timeout','notification',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray, Upload, $timeout, notification) {
    var vm = this; //controllerAs
    /* Object with the types on the IoT MT Platform
     * Key: Value of the type on IoT Lite
     * Value: Id of the type which is displayed to the user
     */
    const types = {
        "Device":"Device",
        "SensingDevice":"Sensor",
        "ActuatingDevice":"Actuator",
    };
    $scope.types = types; // Now this object is able to be accessed by the view

    var ref = firebase.database().ref('models/');
    var modelList = $firebaseArray(ref);

    modelList.$loaded().then(function(){
        console.log("The model list: ", modelList[0].$id);
        $scope.models = modelList;
    });

    /* Function to get the key on an object by a value on this object
     */
    $scope.keyByValue = function(value) {
        var kArray = Object.keys(greetings); // Creating array of keys
        var vArray = Object.values(greetings); // Creating array of values
        var vIndex = vArray.indexOf(value);  // Finding value index 
        return kArray[vIndex];                      // Returning key by value index
    };
    
}]);
