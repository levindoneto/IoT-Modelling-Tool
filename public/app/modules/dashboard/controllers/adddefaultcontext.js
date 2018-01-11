
dashboard.controller("adddefaultcontextController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseObject', '$firebaseArray',
    function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) {
        const vm = this; //controllerAs
        vm.adddefaultcontext = function (context) {
            const ref = firebase.database().ref('contexts/');
            const contextList = $firebaseArray(ref);
            contextList.$loaded().then(() => {
                contextList.$add(context).then((ref) => {
                    console.log('Reference of the added context:\n', ref.toString());
                    swal({
                        title: 'The default context has been added with sucess!',
                        timer: 1700,
                        button: false,
                        icon: 'success'
                    });
                });
            });
        };
    }]);
