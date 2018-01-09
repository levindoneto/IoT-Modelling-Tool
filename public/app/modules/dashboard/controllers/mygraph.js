dashboard.controller('mygraphController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseObject', '$firebaseArray',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) { 
    var vm = this; //controllerAs
    const ref = firebase.database().ref('graphs/'); // Loading all the graphs from the database
    const graphList = $firebaseArray(ref);

    /* Loading data from the database */
    graphList.$loaded().then(() => {
          $scope.graphs = graphList; // scope.graph = database->graph 
    });

    /* Function responsible for passing the selected graph to the scope */
    $scope.modal = function (keySelGraph) {
        const graphDefaultElementsList = [];
        const refSelGraph = firebase.database().ref(`graphs/${keySelGraph}`);
        const graphObj = $firebaseObject(refSelGraph);
        graphObj.$loaded().then(() => { //Loading graphs from the database as an object
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
    };
    
    /* Function to set a default @graph for the real time digital environment */
    $scope.setGraphDefault = function (keyGraph) { // key is given by the user via a option box
        const refDefaults = firebase.database().ref('defaults/'); /* defaults->defaultgraph provide the key on
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
    };

   /* Function for exporting the selected IoT Graph in a JSON format */
    $scope.downloadGraphElement = function (keySelGraph) { // key is given by the user via a option box
        const hyperlinkTag = 'a';
        const d = new Date();
        const h = d.getHours() < 10 ? concatenate('0', d.getHours()) : d.getHours();
        const m = d.getMinutes() < 10 ? concatenate('0', d.getMinutes()) : d.getMinutes();
        const s = d.getSeconds() < 10 ? concatenate('0', d.getSeconds()) : d.getSeconds();
        let graphListAux = [];
        let graphObject = {}; // "@graph":graphListAux
        const refGraphElement = firebase.database().ref(`graphs/${keySelGraph}`);
        refGraphElement.once('value', (snapGraph) => {
            const graphFile = concatenate(snapGraph.val().idgraph, '_', d.toISOString().substring(0, 10), '_', h, '-', m, '-', s);
            let i;
            let j;
            for (i in JSON.parse(snapGraph.val().defaultobjectsgraph)['@graph']) {
                graphListAux.push(JSON.parse(snapGraph.val().defaultobjectsgraph)['@graph'][i]);
            }
            for (j in JSON.parse(snapGraph.val().extensionGraph)) {
                graphListAux.push(JSON.parse(snapGraph.val().extensionGraph)[j]);
            }
            graphObject['@graph'] = graphListAux;
            const pom = document.createElement(hyperlinkTag);
            pom.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(graphObject, null, 2))}`);
            pom.setAttribute('download', concatenate(graphFile, '.json')); // Open the file for dowloading with the given name               
            if (document.createEvent) {
              const downloadFile = document.createEvent('MouseEvents');
              downloadFile.initEvent('click', true, true); // Event may bubble up through the DOM: true,
                                                           //  Event may be canceled: true 
              pom.dispatchEvent(downloadFile);
            }
            else {
              pom.click();
            }
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
        let i;
        for (i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };

    $scope.graphDefaultFormatter = function (json) {
        if (typeof json.defaultobjectsgraph !== 'undefined') {
            const jso = JSON.parse(json.defaultobjectsgraph);
            $scope.allDefaultElementsGraph = jso['@graph'];
        }
    };
}]);
