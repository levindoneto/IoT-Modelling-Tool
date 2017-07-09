
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
                    /* $loaded function:
                     * Returns a promise which is resolved when the initial object data has been 
                     * downloaded from the database. The promise resolves to the $firebaseObject itself.
                     */
                    modelList.$loaded().then(function(){
                        /* $add function:
                         * Creates a new record in the database and adds the record to our 
                         * local synchronized array.
                         * This method returns a promise which is resolved after data has been 
                         * saved to the server. The promise resolves to the Firebase reference 
                         * for the newly added record, providing easy access to its key.
                         */
                        modelList.$add(model).then(function(ref) {
                            swal({
                                title: "It's been added with sucess!",
                                timer: 1700,
                                showConfirmButton: false
                            });
                        });
                    });
                });
            });
        });
    }
}]);
