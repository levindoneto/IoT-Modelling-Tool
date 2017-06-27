dashboard.controller("searchController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseArray','notification','$firebaseObject',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseArray, notification, $firebaseObject) {
    var vm = this;

    $scope.search = function(query) {
        console.log(query);
        $scope.searchItem = query;
        var ref = firebase.database().ref('models/');
        var modelList = $firebaseArray(ref);
        modelList.$loaded().then(function(){
            console.log(modelList)
            $scope.models = modelList; //models
        });
    }

    $scope.modal = function(model) {
        var ref = firebase.database().ref('images/'+model.imageFile);
        var imageObj = $firebaseObject(ref);
        imageObj.$loaded().then(function(){
            console.log("image");
            console.log(imageObj)
            $scope.imagemodel = imageObj.$value;
            $scope.modalmodel = model;
            console.log($scope.modalmodel);
        });
    }
    $scope.modalUserDetail = function(model) {
        var ref = firebase.database().ref('users/'+model.userUid);
        var userDetail = $firebaseObject(ref);
        userDetail.$loaded().then(function(){
            $scope.modaluser = userDetail;
        });
    }

}]);
