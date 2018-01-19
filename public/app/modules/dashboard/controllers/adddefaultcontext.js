dashboard.controller(
    'adddefaultcontextController', [
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
            vm.adddefaultcontext = function (context) {
                const ref = firebase.database().ref('contexts/');
                ref.once('value', snapContext => {
                    let c;
                    for (c in snapContext.val()) {
                        if (context.idcontext === snapContext.val()[c].idcontext) {
                            swal({
                                title: 'There is already a IoT Lite @Context saved with the same Id!',
                                text: 'Please, change the the field Id (@Context) and try to add the element again',
                                icon: 'error'
                            });
                            return;
                        }
                    }
                    const contextList = $firebaseArray(ref);
                    contextList.$loaded().then(() => {
                        console.log(contextList);
                        contextList.$add(context).then(ref => {
                            console.log('Reference of the added context:\n', ref.toString());
                            swal({
                                title: 'The default context has been added with sucess!',
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
