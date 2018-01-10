
dashboard.controller('mycontextController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseObject', '$firebaseArray',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) {
    let vm = this; //controllerAs
    const default_contextProps = [
        'geo',
        'idcontext',
        'iotlite',
        'm3lite',
        'owl',
        'qu',
        'qurectwenty',
        'rdf',
        'rdfs',
        'ssn',
        'time',
        'xsd',
        '$$conf',
        '$id',
        '$priority',
        '$resolved'];
    let ref = firebase.database().ref('contexts/'); // Loading all the contexts from the database
    let contextList = $firebaseArray(ref);

    /* Function used to verify if a property on @context is default (e.g.: Id) or additional (e.g.: geo)
     * @parameters: String: property
     * @return: Boolean: true->the property isn't default, false->the property is a default one
     */
    function verifyAdditionalPropertyContext(elementProperty_i) {
        let this_is_additional_property = true; // It'll be false just if the property has be found in the default properties' list
        for (let prop = 0; prop < default_contextProps.length; prop++) {
            if (elementProperty_i.toUpperCase() === default_contextProps[prop].toUpperCase()) { // the property is a default one
                this_is_additional_property = false; // This means property_i is in the list of default properties
            }           
            else {
                continue; // Don't set the variable up to one because all the list of default properties ought to be checked
            }
        }
        return this_is_additional_property;
    }

    /* Loading data from the database */
    contextList.$loaded().then(() => {
          $scope.contexts = contextList; // scope.context = database->context 
    });

    /* Function responsible for passing the selected context to the scope */
    $scope.modal = function (keySelContext) {
        const ref = firebase.database().ref(`contexts/${keySelContext}`);
        const contextObj = $firebaseObject(ref);
        contextObj.$loaded().then(() => { //Load contexts from the database as an object
            $scope.modelcontext = contextObj;
        });
    };
        
    /* Function for exporting the selected IoT Context in a JSON format */
    $scope.downloadContextElement = function (keySelContext) {
        if (!keySelContext) {
            swal({
                title: 'An IoT Lite @Context must be selected for dowloading',
                text: 'If no one has been defined yet, it can be added in the option IoT Lite @Context of the main menu',
                icon: 'warning'
            });
        } else {
            const TYPE_ELEMENT = 'IoT Lite @Context';
            let contextObject = {}; // "@context":contextList
            const refContextElement = firebase.database().ref(`contexts/${keySelContext}`);
            refContextElement.once('value', (snapContext) => {
                contextObject = snapContext.val();
                delete contextObject.idcontext;
                downloadFileJson(contextObject, snapContext.val().idcontext, TYPE_ELEMENT);
            });
        }
    };

    /* Function to set a default @context for real time digital environment */
    $scope.setcontextdefault = function (keyContext) {
        const refDefaults = firebase.database().ref('defaults/');
        const auxObjContext = {}; 
        auxObjContext.defaultcontext = keyContext; 
        refDefaults.update(auxObjContext);
        swal({
            title: 'The selected context has been set as a default one',
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
    $scope.range = function (min, max, step) {
        step = step || 1;
        const input = [];
        for (let i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };

    /* Function for getting nested elements on @context */
    $scope.getNestedElementsContext = function (elementAdditionalContext) {
        const additionalContextInfo = {}; // Initalize the object from the nested element
        for (var infoContextKey in elementAdditionalContext) {
            if (elementAdditionalContext.hasOwnProperty(infoContextKey)) {
                //console.log('Key: ', infoContextKey.toString());
                additionalContextInfo[infoContextKey] = elementAdditionalContext[infoContextKey];
            }
        }
        return additionalContextInfo; // key:value, key:property_key, value:property_value
    };

    /* Function for getting additional properties on contexts */
    $scope.getAdditionalProperties = function (keySelContext) {
        let ref = firebase.database().ref(`contexts/${keySelContext}`); // Accesing the object context selected by the user
        let contextObj = $firebaseObject(ref);
        const objAddPropsContext = {}; /* Object with the key:value of the additional properties.
                                      * It'll be accessed via scope variable on the view */

        /* This is needed because of the asynchronous way of processing data */
        setTimeout(() => {
            for (const contextPropI in contextObj) { // Ranging on the object @context->key
                if (contextObj.hasOwnProperty(contextPropI)) { // This will check all properties' names on database's key
                    const isAddContProperty = verifyAdditionalPropertyContext(contextPropI);
                    if (isAddContProperty === true) { // Additional info has been found
                        objAddPropsContext[contextPropI] = contextObj[contextPropI]; // Updating the object with a new pair key:value
                    }
                }
            }
            $scope.objAddionalPropsContext = objAddPropsContext; /* Now the object with the additional properties
                                                                  * can be accessed from the view */
        }, 0);
    };
}]);
