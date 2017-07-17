
dashboard.controller("mycontextController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) {
    var vm = this; //controllerAs
    const default_contextProps = [
        "defaultOption",
        "geo",
        "idcontext",
        "iotlite",
        "m3lite",
        "owl",
        "qu",
        "qurectwenty",
        "rdf",
        "rdfs",
        "ssn",
        "time",
        "xsd",
        "$$conf",
        "$id",
        "$priority",
        "$resolved"];
    var ref = firebase.database().ref('contexts/'); // Loading all the contexts from the database
    var contextList = $firebaseArray(ref);


    /* Function used to verify if a property on @context is default (e.g.: Id) or additional (e.g.: geo)
     * @parameters: String: property
     * @return: Boolean: true->the property isn't default, false->the property is a default one
     */
    function verifyAdditionalPropertyContext(elementProperty_i) {
        console.log("MAN, IM HERE...");
        let this_is_additional_property = true; // It'll be false just if the property has be found in the default properties' list
        for (var prop = 0; prop < default_contextProps.length; prop++) {
            if (elementProperty_i.toUpperCase() == default_contextProps[prop].toUpperCase()) { // the property is a default one
                this_is_additional_property = false; // This means property_i is in the list of default properties
            }
            else {
                continue; // Don't set the variable up to one because all the list of default properties ought to be checked
            }
        }
        return this_is_additional_property;
    }
    /* Loading data from the database */
    contextList.$loaded().then(function(){
          $scope.contexts = contextList; // scope.context = database->context 
    });

    /* Function responsible for passing the selected context to the scope */
    $scope.modal = function (keySelContext) {
        console.log("KEY CONTEXT:::: ", keySelContext);
        var ref = firebase.database().ref('contexts/'+keySelContext);
        var contextObj = $firebaseObject(ref);
        contextObj.$loaded().then(function(){ //Loading contexts from the database as an object
            $scope.modelcontext = contextObj;
            console.log("THE VALUE::::::", contextObj);
        });
    };
    
    /* Function to set a default @context for real time digital environment */
    $scope.setcontextdefault = function (keyContext) {
         var ref = firebase.database().ref('defaults/');
        let auxObjContext = {}; 
        auxObjContext["defaultcontext"] = keyContext; 
        ref.update(auxObjContext);
        swal({
            title: "The selected context has been set as a default one",
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
    };

    $scope.getAdditionalProperties = function (keySelContext) {
        var ref = firebase.database().ref('contexts/'+keySelContext);
        var contextObj = $firebaseObject(ref);
        let objAddPropsContext = {}; /* Object with the key:value of the additional properties.
                                      * It'll be accessed via scope variable on the view */
        console.log ("CONTEXT_OBJ: ", contextObj); // For each should be done on contextObj

        /* This is needed because of the asynchronous way of processing data */
        setTimeout(function()
        {
            let len_contextObj = Object.keys(contextObj).length;
            console.log("LENGTH: ", len_contextObj);
            console.log ("ALL KEYS: ", Object.keys(contextObj));
            console.log ("ALL VALUES: ", Object.values(contextObj));

            console.log("STARTING...");
            for (var contextProp_i in contextObj) { // Ranging on the object @context->key
                if(contextObj.hasOwnProperty(contextProp_i)) { // This will check all properties' names on database's key
                    is_add_cont_property = verifyAdditionalPropertyContext(contextProp_i);
                    if (is_add_cont_property == true) {
                        console.log("I have found some additional props");
                        objAddPropsContext[contextProp_i] = contextObj[contextProp_i];
                        console.log("THIS ONE: ", contextProp_i);
                        console.log("THE VALUE OF THIS ONE: ", contextObj[contextProp_i]);
                    }
                }
                //console.log("Key ", i, ": ", Object.keys(contextObj)[i]);
            }
            console.log("ENDING...");
        }, 0);
        
        console.log ("RETURNED OBJECT: ", objAddPropsContext);
        return objAddPropsContext;
    };

}]);
