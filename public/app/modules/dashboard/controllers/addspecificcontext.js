
dashboard.controller('addspecificcontextController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray','Upload','$timeout','notification',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray, Upload, $timeout, notification) {
    var vm = this; //controllerAs
    const ref = firebase.database().ref('contexts/');
    const contextList = $firebaseArray(ref);

    /* Loading data from the database */
    contextList.$loaded().then(() => {
          //console.log('CTX LIST: ', contextList[0]);
          $scope.contexts = contextList;
    });

    /* Adding data on the database (One property:value on a key per time)
     * context->contextKey->newProperty = newPropertyValue
     * On the Front-End: ng-click="addspecificproperty(newProperty, newPropertyValue, contextKey)
     */
    $scope.addspecificproperty = function (contextKey, newProperty, newPropertyValue) {
        const refSpecificContext = firebase.database().ref(`contexts/${contextKey}`); // Accessing context->contextKey on the database
        const auxObjContext = {}; // Auxiliar to add a key:value on a specific object
        if (newPropertyValue.charAt(0) === '{' && newPropertyValue.charAt(newPropertyValue.length - 1) === '}') { // Object value
            // Format: {"k1":"v1","k2":"v2",..."kn":"vn"}
            try {
                auxObjContext[newProperty] = JSON.parse(newPropertyValue);
            }
            catch (err) {
                swal({
                    title: 'The value was given in a wrong format!',
                    text: 'Object values must start with { and end with }',
                    icon: 'error'
                });
            }
        }
        else { // The value is not an object
            auxObjContext[newProperty] = newPropertyValue;
        }
         // In this way just a key with a value is added, not a new object
         refSpecificContext.update(auxObjContext); // Updating the object on the database
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
    
    /* Function to emulate the for i in range with AngularJS 
     * for (min, max, step) {
     *     do something;
     * }
     */
    $scope.range = function(min, max, step) {
        step = step || 1;
        const input = [];
        for (let i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };
}]);
