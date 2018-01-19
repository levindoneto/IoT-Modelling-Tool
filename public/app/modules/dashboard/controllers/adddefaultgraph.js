dashboard.controller(
    'adddefaultgraphController', [
        '$rootScope',
        '$scope',
        '$state',
        '$location',
        'dashboardService',
        'Flash',
        '$firebaseObject',
        '$firebaseArray',
        function (
            $rootScope,
            $scope,
            $state,
            $location,
            dashboardService,
            Flash,
            $firebaseObject,
            $firebaseArray
        ) {
            const vm = this; //controllerAs
            vm.adddefaultgraph = function (graph) {
                const ref = firebase.database().ref('graphs/');
                ref.once('value', snapGraph => {
                    let c;
                    for (c in snapGraph.val()) {
                        if (graph.idgraph === snapGraph.val()[c].idgraph) {
                            swal({
                                title: 'There is already a IoT Lite @Graph saved with the same Id!',
                                text: 'Please, change the the field Id (@Graph) and try to add the element again',
                                icon: 'error'
                            });
                            return;
                        }
                    }
                    const graphList = $firebaseArray(ref);
                    graphList.$loaded().then(() => {
                        graphList.$add(graph).then(ref => {
                            console.log('Reference of the added graph:\n', ref.toString());
                            swal({
                                title: 'The default graph has been added with sucess!',
                                timer: 3000,
                                button: false,
                                icon: 'success'
                            });
                        });
                    });
                    setTimeout(() => {
                        routeSync();
                    }, 3000);
                });
            };
        }
    ]
);
