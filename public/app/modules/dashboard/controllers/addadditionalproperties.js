
dashboard.controller('addadditionalpropertiesController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseObject', '$firebaseArray',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) {
    const vm = this; //controllerAs
    /* Object with the types on the IoT MT Platform
     * Key: Value of the type
     * Value: Id of the type which is displayed to the user */

    const ref = firebase.database().ref('models/');
    const modelList = $firebaseArray(ref);

    //$scope.types = types; // Now this object is able to be accessed by the view
    modelList.$loaded().then(() => {
        $scope.models = modelList; // Devices and Components from the database
    });

    /* Add data on the database (A property:value on a key at the time)
     * context->ContextKey->NewProperty = {
     *     this.NewPropertyType = NewPropertyType,
     *     this.NewPropertyOwlType = NewPropertyOwlType,
     *     if (NewPropertyOwlType = Restriction) {
     *         this.NewPropertyValue = NewPropertyValue;
     *     }
     * }
     * If the value is null from the frontend, it means that the owl_type is not 'Restriction',
     * therefore, this value will be gotten on the fly during the execution of the environment
     * 
     * On the Front-End: ng-click="addspecificproperty(NewProperty, NewPropertyValue, ContextKey)
     */
    $scope.addspecificproperty = function (ContextKey, NewProperty, NewPropertyType, NewPropertyOwlType, NewPropertyValue) {
        // Access context->ContextKey on the database
        const refContextKey = firebase.database().ref(`models/${ContextKey}`);
        const auxObjContext = {}; // Auxiliar to add a key:value on a specific object
        // Auxiliar which contains the following information:  
        // property_type, owl_type and value if the owl_type is Restriction */
        const auxValuesObjContext = {};    
        auxValuesObjContext.NewPropertyType = NewPropertyType; 
        if (NewPropertyOwlType === true) { // Checkbox checked for static
            auxValuesObjContext.NewPropertyOwlType = 'owl:Restriction';
        } else {
            auxValuesObjContext.NewPropertyOwlType = 'owl:DatatypeProperty';
        }
        // It can't be null if the owl_type is 'Restriction'
        auxValuesObjContext.NewPropertyValue = NewPropertyValue;
        // In this way just a key with an object is added, not a new object
        auxObjContext[NewProperty] = auxValuesObjContext;
        // Update the object on the database
        refContextKey.update(auxObjContext);
        swal({
            title: 'The new property and its value have been added with success!',
            timer: 3000,
            button: false,
            icon: 'success'
        });
        setTimeout(() => {
            routeSync();
        }, 3000); 
    };
    
    /* Function which emulates the (for i in range) with AngularJS 
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
