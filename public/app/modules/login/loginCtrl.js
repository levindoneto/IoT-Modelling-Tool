
login.controller('loginCtrl', ['$rootScope', '$scope', '$state', '$location', 'loginService', 'Flash','apiService','$firebaseAuth','$firebaseObject','$firebaseArray',
function ($rootScope, $scope, $state, $location, loginService, Flash, apiService, $firebaseAuth, $firebaseObject, $firebaseArray) {
    var vm = this;
    var auth = $firebaseAuth();
    vm.getUser = {};
    vm.setUser = {};
    vm.signIn = true;
    const ref = firebase.database().ref('defaults/defaultcontext');
    const refg = firebase.database().ref('defaults/defaultgraph');
    const contextDefaultObj = $firebaseObject(ref);
    const refContexts = firebase.database().ref('contexts/');
    const allContexts = $firebaseObject(refContexts);
    const refGraphs = firebase.database().ref('graphs/');
    const allGraphs = $firebaseObject(refGraphs);
    const graphDefaultObj = $firebaseObject(refg);
    const DEFAULT_CONTEXT_ID = 'defContextId';
    const DEFAULT_GRAPH_ID = 'defGraphId';
    const DEFAULT_CONTEXT = 'IoT Lite @Context (IPVS)';
    const DEFAULT_GRAPH = 'IoT Lite @Graph (IPVS)';
    setTimeout(() => {
        try {
            localStorage.setItem(DEFAULT_CONTEXT_ID, allContexts[contextDefaultObj.$value].idcontext);
        } catch (err) {
            console.log('A problem for getting the IoT Lite @Context has been found.');
            console.log('Cause: Slow internet connection.\nDetails:\n', err);
            console.log('A new attempt is being done right now.');
            setTimeout(() => {
                if (allContexts[contextDefaultObj.$value]) {
                    localStorage.setItem(DEFAULT_CONTEXT_ID, allContexts[contextDefaultObj.$value].idcontexth);
                } else {
                    localStorage.setItem(DEFAULT_GRAPH_ID, DEFAULT_CONTEXT);
                }
            }, 2000);
        }
    }, 1500);

    setTimeout(() => {
        try {
            localStorage.setItem(DEFAULT_GRAPH_ID, allGraphs[graphDefaultObj.$value].idgraph);
        } catch (err) {
            console.log('A problem for getting the IoT Lite @Graph has been found.');
            console.log('Cause: Slow internet connection.\nDetails:\n', err);
            console.log('A new attempt is being done right now.');
            setTimeout(() => {
                if (allGraphs[graphDefaultObj.$value]) {
                    localStorage.setItem(DEFAULT_GRAPH_ID, allGraphs[graphDefaultObj.$value].idgraph);
                } else {
                    localStorage.setItem(DEFAULT_GRAPH_ID, DEFAULT_GRAPH);
                }
            }, 2000);
        }        
    }, 1500);


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
