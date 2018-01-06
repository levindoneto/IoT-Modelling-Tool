

dashboard.controller('mygraphController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) { 
    var vm = this; //controllerAs
    const default_graphProps = [];
    const ref = firebase.database().ref('graphs/'); // Loading all the graphs from the database
    const graphList = $firebaseArray(ref);

    /* Loading data from the database */
    graphList.$loaded().then(() => {
          $scope.graphs = graphList; // scope.graph = database->graph 
    });

    /* Function responsible for passing the selected graph to the scope */
    $scope.modal = function (keySelGraph) {
        let graphDefaultElementsList = [];
        var ref = firebase.database().ref(`graphs/${keySelGraph}`);
        var graphObj = $firebaseObject(ref);
        graphObj.$loaded().then(() => { //Loading graphs from the database as an object
            let objDefaultGraph = JSON.parse(graphObj.defaultobjectsgraph);
            let i;
            for (i in objDefaultGraph['@graph']) {
                graphDefaultElementsList.push(objDefaultGraph['@graph'][i]);
            }
            $scope.modelgraph = graphObj;
            $scope.graphDefaultElements = graphDefaultElementsList;
        });
    };
    
    /* Function to set a default @graph for the real time digital environment */
    $scope.setgraphdefault = function (keyGraph) { // key is given by the user via a option box 
        const refDefaults = firebase.database().ref('defaults/'); /* defaults->defaultgraph provide the key on
                                                         * graphs for the default @graph */ 
        let auxObjGraph; 
        auxObjGraph.defaultgraph = keyGraph; 
        refDefaults.update(auxObjGraph); // It's just a replacement of values, once the object defaults has unique keys
        swal({
            title: 'The selected graph has been set as a default one',
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
        var input = [];
        let i;
        for (i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };

    $scope.getAdditionalGraph = function (keySelGraph) {
        const refAdditional = firebase.database().ref(`graphs/${keySelGraph}`); // Accesing the object graph selected by the user
        let graphObj = $firebaseObject(refAdditional);
        return true;
    };

    $scope.graphDefaultFormatter = function (json) {
        if (typeof json.defaultobjectsgraph !== 'undefined') {
            let jso = JSON.parse(json.defaultobjectsgraph);
            $scope.allDefaultElementsGraph = jso['@graph'];
        }
    };
}]);
