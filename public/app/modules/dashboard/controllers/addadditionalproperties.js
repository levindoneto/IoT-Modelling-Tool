
dashboard.controller('addadditionalpropertiesController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseObject', '$firebaseArray', 'Upload', '$timeout', 'notification',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray, Upload, $timeout, notification) {
    const vm = this; //controllerAs
    /* Object with the types on the IoT MT Platform
     * Key: Value of the type on IoT Lite
     * Value: Id of the type which is displayed to the user
     */
    const types = {
        Device: 'Device',
        SensingDevice: 'Sensor',
        ActuatingDevice: 'Actuator',
    };
    $scope.types = types; // Now this object is able to be accessed by the view

    const ref = firebase.database().ref('models/');
    const modelList = $firebaseArray(ref);

    modelList.$loaded().then(() => {
        console.log('The model list: ', modelList[0].$id);
        $scope.models = modelList;
    });

    /* Function to get the key on an object by a value on this object
     */
    $scope.keyByValue = function (value) {
        let typeDB;
        console.log('Value:::::', value, '::::::');

        if (value === 'Sensor') {
            console.log('ASSHOLE');
        }

        switch (value) {
            case 'Device':
                typeDB = 'Device';
            case 'Sensor':
                typeDB = 'SensingDevice';
            case 'Actuator':
                typeDB = 'ActuatingDevice';
            default:
                typeDB = '';
        }
        const kArray = Object.keys(types); // Creating array of keys
        const vArray = Object.values(types); // Creating array of values
        const vIndex = vArray.indexOf(value);  // Finding value index 
        console.log(typeDB);
        return typeDB;                      // Returning key by value index
    };

    /* Adding data on the database (One property:value on a key per time)
     * context->ContextKey->NewProperty = {
     *     this.NewPropertyType = NewPropertyType,
     *     this.NewPropertyOwlType = NewPropertyOwlType,
     *     if (NewPropertyOwlType = Restriction) {
     *         this.NewPropertyValue = NewPropertyValue;
     *     }
     * }
     * If the value is null from the frontend, it means that the owl_type isn't Restriction,
     * so this value will be gotten on the fly during the execution of the environment
     * 
     * On the Front-End: ng-click="addspecificproperty(NewProperty, NewPropertyValue, ContextKey)
     */
    $scope.addspecificproperty = function (ContextKey, NewProperty, NewPropertyType, NewPropertyOwlType, NewPropertyValue) {
        //console.log(Key: ",ContextKey);
        const ref = firebase.database().ref(`models/${ContextKey}`); // Accessing context->ContextKey on the database
        const auxObjContext = {}; // Auxiliar to add a key:value on a specific object
        const auxValuesObjContext = {}; /* Auxiliar with the following information:
                                       * property_type, owl_type and value if the owl_type is Restriction */    
        auxValuesObjContext.NewPropertyType = NewPropertyType; 
        auxValuesObjContext.NewPropertyOwlType = NewPropertyOwlType;
        auxValuesObjContext.NewPropertyValue = NewPropertyValue; // It can't be null if the owl_type is Restriction

        
        auxObjContext[NewProperty] = auxValuesObjContext; // In this way just a key with an object is added, not a new object
        
        ref.update(auxObjContext); // Updating the object on the database
        //console.log("Value: ", NewPropertyValue);
        swal({
            title: 'The new property and its value have been added with success!',
            timer: 1700,
            showConfirmButton: false
        });
    };
    
    /* Function to emulate the for i in range with AngularJS 
     * for (min, max, step) {
     *     do something;
     * }
     */
    $scope.range = function (min, max, step) {
        step = step || 1;
        const input = [];
        for (let i = min; i <= max; i += step) {
            input.push(i);
        }
    return input;
    };
}]);
