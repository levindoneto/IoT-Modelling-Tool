dashboard.controller('mygraphController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseObject', '$firebaseArray',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) { 
    const vm = this; //controllerAs
    const ref = firebase.database().ref('graphs/'); // Load all the graphs from the database
    const graphList = $firebaseArray(ref);

    /* Load the data from the database */
    graphList.$loaded().then(() => {
          $scope.graphs = graphList; // scope.graph = database->graph 
    });

    /* Function which is responsible for passing the selected graph to the scope */
    $scope.modal = function (keySelGraph) {
        if (!keySelGraph) {
            swal({
                title: 'An IoT Lite @Graph must be selected to it be shown',
                text: 'If no one has been defined yet, it can be added in the option IoT Lite @Graph of the main menu',
                icon: 'warning'
            });
        } else {
            const graphDefaultElementsList = [];
            const refSelGraph = firebase.database().ref(`graphs/${keySelGraph}`);
            const graphObj = $firebaseObject(refSelGraph);
            graphObj.$loaded().then(() => { //Load the graphs from the database as an object
                const objDefaultGraph = JSON.parse(graphObj.defaultobjectsgraph);
                const objExtensionGraph = JSON.parse(graphObj.extensionGraph);
                let i;
                let j;
                for (i in objDefaultGraph['@graph']) {
                    graphDefaultElementsList.push(objDefaultGraph['@graph'][i]);
                }
                for (j in objExtensionGraph) {
                    graphDefaultElementsList.push(objExtensionGraph[j]);
                }
                $scope.modelgraph = graphObj;
                $scope.graphDefaultElements = graphDefaultElementsList;
            });
        }
    };
    
    /* Function which sets a default @graph for the real time digital environment */
    $scope.setGraphDefault = function (keyGraph) { // The key is given by the user via a option box
        if (!keyGraph) {
            swal({
                title: 'An IoT Lite @Graph must be selected before it been set as default',
                text: 'If no one has been defined yet, it can be added in the option IoT Lite @Graph of the main menu',
                icon: 'warning'
            });
        } else {
            const refDefaults = firebase.database().ref('defaults/'); /* defaults->defaultgraph provides the key for
                                                                       * graphs for the default @graph */ 
            const auxObjGraph = {}; 
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
        } 
    };

   /* Function for exporting the selected IoT Graph in a JSON format */
    $scope.downloadGraphElement = function (keySelGraph) { // key is given by the user via a option box
        if (!keySelGraph) {
            swal({
                title: 'An IoT Lite @Graph must be selected for dowloading',
                text: 'If no one has been defined yet, it can be added in the option IoT Lite @Graph of the main menu',
                icon: 'warning'
            });
        } else {
            const graphListAux = [];
            const graphObject = {}; // "@graph":graphListAux
            const refGraphElement = firebase.database().ref(`graphs/${keySelGraph}`);
            const TYPE_ELEMENT = 'IoT Lite @Graph';
            refGraphElement.once('value', (snapGraph) => {
                let i;
                let j;
                for (i in JSON.parse(snapGraph.val().defaultobjectsgraph)['@graph']) {
                    graphListAux.push(JSON.parse(snapGraph.val().defaultobjectsgraph)['@graph'][i]);
                }
                for (j in JSON.parse(snapGraph.val().extensionGraph)) {
                    graphListAux.push(JSON.parse(snapGraph.val().extensionGraph)[j]);
                }
                graphObject['@graph'] = graphListAux;
                downloadFileJson(graphObject, snapGraph.val().idgraph, TYPE_ELEMENT);
            }); 
        }
    };   

    $scope.graphDefaultFormatter = function (json) {
        if (typeof json.defaultobjectsgraph !== 'undefined') {
            const jso = JSON.parse(json.defaultobjectsgraph);
            $scope.allDefaultElementsGraph = jso['@graph'];
        }
    };
}]);
