
dashboard.controller('adddefaultgraphController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseObject', '$firebaseArray', 'Upload', '$timeout', 'notification',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray, Upload, $timeout, notification) {
    var vm = this; //controllerAs
    vm.adddefaultgraph = function (graph) {
        //graph.userUid = $rootScope.userDB.uid;
        const ref = firebase.database().ref('graphs/');
        const graphList = $firebaseArray(ref);
        graphList.$loaded().then(() => {
            graphList.$add(graph).then((ref) => {
                swal({
                    title: 'The default graph has been added with sucess!',
                    timer: 3000,
                    button: false,
                    icon: 'success'
                });
                setTimeout(() => {
                    routeSync();
                }, 3000); 
            });
        });
    };
}]);
