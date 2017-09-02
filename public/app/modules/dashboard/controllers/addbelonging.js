
dashboard.controller("addbelongingController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray','Upload','$timeout','notification',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray, Upload, $timeout, notification) {
    const vm = this;

    vm.addbelonging = function (model, file) {
        Upload.base64DataUrl(file).then((base64Url) => {
            model.userUid = $rootScope.userDB.uid;
            const refImages = firebase.database().ref('images/');
            const imageList = $firebaseArray(refImages);
            imageList.$loaded().then(() => {
                imageList.$add(base64Url).then((imref) => {
                    //console.log("imref");
                    //console.log(imref)
                    model.imageFile = imref.key;

                    const ref = firebase.database().ref('models/');
                    const modelList = $firebaseArray(ref);
                    /* $loaded function:
                     * Returns a promise which is resolved when the initial object data has been 
                     * downloaded from the database. The promise resolves to the $firebaseObject itself.
                     */
                    modelList.$loaded().then(() => {
                        /* $add function:
                         * Creates a new record in the database and adds the record to our 
                         * local synchronized array.
                         * This method returns a promise which is resolved after data has been 
                         * saved to the server. The promise resolves to the Firebase reference 
                         * for the newly added record, providing easy access to its key.
                         */
                        modelList.$add(model).then((ref) => {
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
    };
}]);
