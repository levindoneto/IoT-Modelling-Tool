
dashboard.controller("digitalenvironmentController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseArray','$firebaseObject','notification',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseArray, $firebaseObject, notification) {
    var vm = this;

    var ref = firebase.database().ref('models/');
    var modelList = $firebaseArray(ref);
    modelList.$loaded().then(function(){
        console.log(modelList)
        $scope.models = modelList;
    });

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
    }]);
