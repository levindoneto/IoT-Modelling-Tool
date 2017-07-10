
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
        let typeDB;
        console.log("Value:::::", value,"::::::");

        if (value === "Sensor") {
            console.log("ASSHOLE");
        }

        switch (value) {
            case "Device":
                typeDB = "Device";
            case "Sensor":
                typeDB = "SensingDevice";
            case "Actuator":
                typeDB = "ActuatingDevice";
            default:
                typeDB = "";
        }
        var kArray = Object.keys(types); // Creating array of keys
        var vArray = Object.values(types); // Creating array of values
        var vIndex = vArray.indexOf(value);  // Finding value index 
        console.log(typeDB);
        return typeDB;                      // Returning key by value index
    };

    /* Adding data on the database (One property:value on a key per time)
     * context->context_key->new_property = new_property_value
     * On the Front-End: ng-click="addspecificproperty(new_property, new_property_value, context_key)
     */
    $scope.addspecificproperty = function (context_key, new_property, new_property_value) {
        console.log("THE KEY: ",context_key);
        var ref = firebase.database().ref('models/'+context_key); // Accessing context->context_key on the database
        let auxObjContext = {}; // Auxiliar to add a key:value on a specific object
        auxObjContext[new_property] = new_property_value; // In this way just a key with a value is added, not a new object
        ref.update(auxObjContext); // Updating the object on the database
        console.log("add the value: ", new_property_value);
        swal({
            title: "The new property and its value have been added with success!",
            timer: 1700,
            showConfirmButton: false
        });
    };
    
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
    }
    
}]);
