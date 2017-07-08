
dashboard.controller("mybelongingsController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) {
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
          //console.log("ONE IMAGE FROM THE DATABASE::: ", $scope.imagemodel);
      });
  }

  $scope.remove = function(model) {
      console.log("deleting...");
      var modelID = model.$id;
      console.log(modelID);
      var ref = firebase.database().ref('models/'+model.$id);
      var modelObject = $firebaseObject(ref);

      swal({
          title: "Are you sure you wanna delet this device/component?",
          text: "You can't change this after!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, I'm sure!",
          cancelButtonText: "No, cancel!",
          closeOnConfirm: false,
          closeOnCancel: false
      },
      function(isConfirm){
          if (isConfirm) {
              modelObject.$loaded().then(function(){
                modelObject.$remove().then(function(){
                    swal({
                      title: "The device has been deleted with success!",
                      timer: 1500,
                      showConfirmButton: false });
                    }, function(error) {
                          console.log("Error:", error);
                  });
              });
          } else {
            swal({
              title: "Your device hasn't been deleted!",
              timer: 1500,
              showConfirmButton: false });
          }
      });
    }
}]);
