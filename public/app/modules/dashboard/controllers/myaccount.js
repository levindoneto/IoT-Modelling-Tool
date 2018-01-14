dashboard.controller('myaccountController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseArray','$firebaseAuth','$firebaseObject',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseArray, $firebaseAuth, $firebaseObject) {
    const vm = this;
    const ref = firebase.database().ref('defaults/defaultcontext'); // Acces the object context selected by the user
    const refg = firebase.database().ref('defaults/defaultgraph');
    const contextDefaultObj = $firebaseObject(ref); // Access the default @context key
    const refContexts = firebase.database().ref('contexts/'); // Access the object context selected by the user
    const allContexts = $firebaseObject(refContexts);
    const refGraphs = firebase.database().ref('graphs/'); // Access the object @graphs from Firebase
    const allGraphs = $firebaseObject(refGraphs);
    const graphDefaultObj = $firebaseObject(refg); // Access the default @graph key
    const DEFAULT_CONTEXT_ID = 'defContextId';
    const DEFAULT_GRAPH_ID = 'defGraphId';

    setTimeout(() => {
        try {
            $scope.currentDefaultContext = localStorage.getItem(DEFAULT_CONTEXT_ID) || allContexts[contextDefaultObj.$value].idcontext;
        } catch (err) {
            console.log(err);
        }
    }, 2000);

    setTimeout(() => {
        try {
            $scope.currentDefaultGraph = localStorage.getItem(DEFAULT_GRAPH_ID) || allGraphs[graphDefaultObj.$value].idgraph;
        } catch (err) {
            console.log(err);
        }
    }, 2000);

    $scope.showAccountinfo = function (user) {
        $scope.show = true;
        $scope.Username = user.Username;
        $scope.Email = user.Email;
        $scope.addr = user.addr;
        $scope.id = user.$id;
    };

    /* Function to verify if a @Context has been set for the modelling environment */
    $scope.verifySettingDefaultContext = function () {
        if (!contextDefaultObj.$value) { // Default @context isn't set
            $scope.defaultContextIsSet = false;
        } else {
            $scope.defaultContextIsSet = true;
        }
    };

    $scope.verifySettingDefaultGraph = function () {
        if (!graphDefaultObj.$value) { // Default @graph isn't set
            $scope.defaultGraphIsSet = false;
        } else {
            $scope.defaultGraphIsSet = true;
        }
    };
    
    $scope.updateAdminInfoDB = function (userId, isAdmin) {
        const refUser = firebase.database().ref(`users/${userId}`); 
        const auxUserAdmin = {}; // isAdmin: Boolean
        auxUserAdmin.isAdmin = isAdmin;
        refUser.update(auxUserAdmin);
    };

    $scope.editFormSubmit = function (userId, username) {
        const refUser = firebase.database().ref(`users/${userId}`); 
        const auxUserUsername = {}; // isAdmin: Boolean
        auxUserUsername.Username = username;
        refUser.update(auxUserUsername);
        swal({
            title: 'Your username has been modified successfully',
            icon: 'success',
            timer: 3000,
            button: false
        });
        setTimeout(() => {
            routeSync();
        }, 3000);
    };
}]);
