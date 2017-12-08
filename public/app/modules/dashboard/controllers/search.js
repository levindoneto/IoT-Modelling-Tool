dashboard.controller("searchController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseArray', 'notification', '$firebaseObject',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseArray, notification, $firebaseObject) {
    var vm = this;

    $scope.search = function (query) {
        //console.log(query);
        $scope.searchItem = query;
        const ref = firebase.database().ref('models/');
        const modelList = $firebaseArray(ref);
        modelList.$loaded().then(() => {
            //console.log(modelList)
            $scope.models = modelList; //models
        });
    };

    $scope.modal = function(model) {
        var ref = firebase.database().ref('images/'+model.imageFile);
        var imageObj = $firebaseObject(ref);
        imageObj.$loaded().then(() => {
            $scope.imagemodel = imageObj.$value;
            $scope.modalmodel = model;
        });
    };
    
    $scope.modalUserDetail = function(model) {
        var ref = firebase.database().ref('users/'+model.userUid);
        var userDetail = $firebaseObject(ref);
        userDetail.$loaded().then(() => {
            $scope.modaluser = userDetail;
        });
    };
}]);
