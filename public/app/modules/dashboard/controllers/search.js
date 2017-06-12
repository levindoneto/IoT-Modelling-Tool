
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
            $scope.models = modelList;

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



    $scope.trade = function(model, id) {
        var createTrade = ({'state': 'received', 'sender': $rootScope.userDB.uid, 'receiver': model.userUid, 'modelSenderIsInterested': {'id': model.$id, 'model': model}, 'modelReceiverIsInterested' : null})
        var ref = firebase.database().ref('belongings/');
        notification.send("Você recebeu proposta de troca. Verificar no menu 'Trocas'", model.userUid);
        var belongingsList = $firebaseArray(ref);
        belongingsList.$loaded().then(function(){
            // add an item
            belongingsList.$add(createTrade).then(function(ref) {
                swal({
                    title: "Interesse enviado ao usuário!",
                    timer: 1700,
                    showConfirmButton: false });

                });

            });


        }


    }]);
