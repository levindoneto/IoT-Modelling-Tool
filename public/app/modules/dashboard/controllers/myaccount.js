

dashboard.controller("myaccountController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseArray','$firebaseAuth','$firebaseObject',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseArray, $firebaseAuth, $firebaseObject) {
    var vm = this;

    $scope.showAccountinfo = function(user){
      $scope.show = true;
      $scope.Username = user.Username;
      $scope.Email = user.Email;
      $scope.addr = user.addr;
      $scope.id = user.$id;
    }

    $scope.editFormSubmit = function(){
      var user = firebase.auth().currentUser;
      var ref = firebase.database().ref('users/'+$scope.id);
      var userDB = $firebaseObject(ref);

      userDB.$loaded().then(function(){
        userDB.Username = $scope.Username;
        userDB.addr = $scope.addr;
        userDB.Email = $scope.Email;
        userDB.$save().then(function(ref) {

        },
        function(error) {
          console.log("Error:", error);
        });
      });
    user.updateEmail($scope.Email);
  }

  $('#form_id').submit(function() {
    $('#editModal').modal('hide');
  });

}]);
