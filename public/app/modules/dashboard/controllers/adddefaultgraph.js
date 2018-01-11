
dashboard.controller('adddefaultgraphController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseObject', '$firebaseArray',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) {
    const vm = this; //controllerAs
    vm.adddefaultgraph = function (graph) {
        const ref = firebase.database().ref('graphs/');
        const graphList = $firebaseArray(ref);
        graphList.$loaded().then(() => {
            graphList.$add(graph).then((ref) => {
                console.log('Reference of the added graph: \n', ref.toString());
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
