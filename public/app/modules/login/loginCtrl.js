
login.controller('loginCtrl', ['$rootScope', '$scope', '$state', '$location', 'loginService', 'Flash','apiService','$firebaseAuth','$firebaseObject','$firebaseArray',
function ($rootScope, $scope, $state, $location, loginService, Flash, apiService, $firebaseAuth, $firebaseObject, $firebaseArray) {
    var vm = this;
    var auth = $firebaseAuth();
    vm.getUser = {};
    vm.setUser = {};
    vm.signIn = true;
    //access login
    vm.login = function (data) {
        auth.$signInWithEmailAndPassword(data.Email, data.Password).then((firebaseUser) => {
        }).catch((error) => {
            Flash.create(`Danger: Fail in the autentication->${error}`, 'large-text');
        });
    };

    //get registration details
    vm.register = function () {
        var refUsers = firebase.database().ref('users/');
        var userList = $firebaseArray(refUsers);
        var alreadyExist = false;

        userList.$loaded().then(() => {
            if(!alreadyExist)
            auth.$createUserWithEmailAndPassword(vm.setUser.Email, vm.setUser.Password)
            .then((firebaseUser) => {
                var ref = firebase.database().ref(`users/${firebaseUser.uid}`);
                var obj = $firebaseObject(ref);
                obj.$bindTo($rootScope, 'user').then(() => {
                    vm.setUser.isAdmin = Boolean(false | vm.setUser.isAdmin);
                    $rootScope.user = vm.setUser;
                });
                }).catch((error) => {
                    Flash.create(`Danger: Error with the register ->${error}`, 'large-text');
                });
            }
        );
    };

    auth.$onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
            $state.go('app.myaccount'); // Go to my account when the user is allowed to access the platform
        } 
    });
}]);
