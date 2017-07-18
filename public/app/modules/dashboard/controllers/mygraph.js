
dashboard.controller("mygraphController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) {
    var vm = this; //controllerAs
    const default_graphProps = [];
    var ref = firebase.database().ref('graphs/'); // Loading all the graphs from the database
    var graphList = $firebaseArray(ref);

    /* Loading data from the database */
    graphList.$loaded().then(function(){
          $scope.graphs = graphList; // scope.graph = database->graph 
    });

    /* Function responsible for passing the selected graph to the scope */
    $scope.modal = function (keySelGraph) {
        console.log("KEY GRAPH:::: ", keySelGraph);
        var ref = firebase.database().ref('graphs/'+keySelGraph);
        var graphObj = $firebaseObject(ref);
        graphObj.$loaded().then(function(){ //Loading graphs from the database as an object
            $scope.modelgraph = graphObj;
            console.log("THE VALUE::::::", graphObj);
        });
    };
    


}]);
