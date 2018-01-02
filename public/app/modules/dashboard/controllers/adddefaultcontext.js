
dashboard.controller("adddefaultcontextController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseObject', '$firebaseArray', 'Upload', '$timeout', 'notification',
    function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray, Upload, $timeout, notification) {
        var vm = this; //controllerAs
        vm.adddefaultcontext = function (context) {
            //context.userUid = $rootScope.userDB.uid;
            var ref = firebase.database().ref('contexts/');
            var contextList = $firebaseArray(ref);
            contextList.$loaded().then(function () {
                contextList.$add(context).then(function (ref) {
                    swal({
                        title: 'The default context has been added with sucess!',
                        timer: 1700,
                        button: false,
                        icon: 'success'
                    });
                    //console.log("The context: ", context);
                });
            });
        };
    }]);
