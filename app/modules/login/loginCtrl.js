

login.controller("loginCtrl", ['$rootScope', '$scope', '$state', '$location', 'loginService', 'Flash','apiService','$firebaseAuth','$firebaseObject','$firebaseArray',
function ($rootScope, $scope, $state, $location, loginService, Flash, apiService, $firebaseAuth, $firebaseObject, $firebaseArray) {
    var vm = this;

    vm.getUser = {};
    vm.setUser = {};
    vm.signIn = true;
    var auth = $firebaseAuth();
    //access login
    vm.login = function (data) {
        console.log(data)
        auth.$signInWithEmailAndPassword(data.Email, data.Password).then(function(firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);

        }).catch(function(error) {
            Flash.create('danger', 'Fail in the autentication->' + error, 'large-text');

        });

    };

    //get registration details
    vm.register = function () {
            var refUsers = firebase.database().ref('users/');
            var userList = $firebaseArray(refUsers);
            var alreadyExist = false;

            userList.$loaded().then(function(){

                if(!alreadyExist)
                auth.$createUserWithEmailAndPassword(vm.setUser.Email, vm.setUser.Password)
                .then(function(firebaseUser) {

                    var ref = firebase.database().ref('users/'+firebaseUser.uid);
                    var obj = $firebaseObject(ref);

                    obj.$bindTo($rootScope, "user").then(function() {
                        console.log($rootScope.user);
                        $rootScope.user = vm.setUser;
                    });

                }).catch(function(error) {
                    Flash.create('danger', 'Error with the register ->' + error, 'large-text');



                });
            }
        );

    };



    auth.$onAuthStateChanged(function(firebaseUser) {
        if (firebaseUser) {
            $state.go('app.myaccount');
            console.log("User " + firebaseUser.uid + " created successfully!");
        } else {
            console.log("Signed out");
        }
    });


}]);
