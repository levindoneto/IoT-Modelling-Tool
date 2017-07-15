
dashboard.controller("mycontextController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) {
    var vm = this; //controllerAs
    var ref = firebase.database().ref('contexts/'); // Loading all the contexts from the database
    var contextList = $firebaseArray(ref);

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
}]);
