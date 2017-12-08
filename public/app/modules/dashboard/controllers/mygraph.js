

dashboard.controller('mygraphController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) {
    
    var vm = this; //controllerAs
    const default_graphProps = [];
    var ref = firebase.database().ref('graphs/'); // Loading all the graphs from the database
    var graphList = $firebaseArray(ref);

    /* Loading data from the database */
    graphList.$loaded().then(() => {
          $scope.graphs = graphList; // scope.graph = database->graph 
    });

    /* Function responsible for passing the selected graph to the scope */
    $scope.modal = function (keySelGraph) {
        let graphDefaultElementsList = [];
        //console.log("Key graph: ", keySelGraph);
        var ref = firebase.database().ref(`graphs/${keySelGraph}`);
        var graphObj = $firebaseObject(ref);
        graphObj.$loaded().then(() => { //Loading graphs from the database as an object
            //console.log('Keys @graph: ', Object.keys(graphObj));
            //console.log("Values @graph: ", typeof JSON.parse(graphObj.defaultobjectsgraph));
            let objDefaultGraph = JSON.parse(graphObj.defaultobjectsgraph);
            //console.log("::: objDefaultGraph :::");
            //console.log("KEYS: ", Object.keys(objDefaultGraph));
            //console.log("VALUES: ", Object.values(objDefaultGraph));
            //console.log("LENGTH: ", Object.keys(objDefaultGraph).length);
            for (i in objDefaultGraph["@graph"]) {
                graphDefaultElementsList.push(objDefaultGraph["@graph"][i]);
            }
            //console.log("graphDefaultElementsList: ", graphDefaultElementsList);
            $scope.modelgraph = graphObj;
            $scope.graphDefaultElements = graphDefaultElementsList;
        });
    };
    
    /* Function to set a default @graph for the real time digital environment */
    $scope.setgraphdefault = function (keyGraph) { // key is given by the user via a option box 
        var ref = firebase.database().ref('defaults/'); /* defaults->defaultgraph provide the key on
                                                         * graphs for the default @graph */ 
        let auxObjGraph = {}; 
        auxObjGraph["defaultgraph"] = keyGraph; 
        ref.update(auxObjGraph); // It's just a replacement of values, once the object defaults has unique keys
        swal({
            title: "The selected graph has been set as a default one",
            timer: 1700,
            button: false,
            icon: 'success'
        });
    };

    /* Function to emulate the for i in range with AngularJS 
     * for (min, max, step) {
     *     do something;
     * }
     */
    $scope.range = function (min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };

    $scope.getAdditionalGraph = function (keySelGraph) {
        var ref = firebase.database().ref(`graphs/${keySelGraph}`); // Accesing the object graph selected by the user
        var graphObj = $firebaseObject(ref);
        //TODO (get the devices/components' elements)
        return true;
    };

    $scope.graphDefaultFormatter = function (json) {
        //console.log("THE JSON: ", json);
        if (typeof json.defaultobjectsgraph !== 'undefined') {
            //console.log('Type of the parameter: ', typeof json.defaultobjectsgraph);
            //console.log('Value of the parameter: ', json.defaultobjectsgraph);
            var jso = JSON.parse(json.defaultobjectsgraph);
            //console.log("TYPE OF JSON-GRAPH: ", jso["@graph"]);
            $scope.allDefaultElementsGraph = jso["@graph"];
        }
        //JSON.parse();
        //return json = JSON.stringify(json, undefined, 2);
    };
}]);
