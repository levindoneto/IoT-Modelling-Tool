

dashboard.controller("addbelongingController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray','Upload','$timeout','notification',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray, Upload, $timeout, notification) {
    var vm = this;

    vm.addbelonging = function (model, file) {
        Upload.base64DataUrl(file).then(function(base64Url) {
            model.userUid = $rootScope.userDB.uid;
            var refImages = firebase.database().ref('images/');
            var imageList = $firebaseArray(refImages);
            imageList.$loaded().then(function(){
                imageList.$add(base64Url).then(function(imref) {
                    console.log("imref");
                    console.log(imref)
                    model.imageFile = imref.key;

                    var ref = firebase.database().ref('models/');
                    var modelList = $firebaseArray(ref);
                    modelList.$loaded().then(function(){

                        modelList.$add(model).then(function(ref) {
                            swal({
                                title: "The model was added with sucess!",
                                timer: 1700,
                                showConfirmButton: false });
                                //Now it needs to send notifications to all users in wishlist
                                var ref = firebase.database().ref('wishlist/');
                                var wishListLoad = $firebaseArray(ref);
                                wishListLoad.$loaded().then(function(){
                                    var arrayOfKeywords = model.name.split(" ");
                                    angular.forEach(wishListLoad, function(wish) {
                                        angular.forEach(arrayOfKeywords, function(keyword) {
                                            if(keyword.toUpperCase() == wish.word.toUpperCase()){
                                                notification.send("Lista de Desejos: um model que possui a palavra chave '"+ keyword+"' foi adicionado! Use a pesquisa para encontrá-lo", wish.user)
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                    });
                });
            }

        }]);
