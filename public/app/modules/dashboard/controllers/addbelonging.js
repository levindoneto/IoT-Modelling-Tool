
dashboard.controller("addbelongingController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray','Upload','$timeout','notification',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray, Upload, $timeout, notification) {
    const vm = this;

    vm.addbelonging = function (prefix, type, model, file) { // prefix->type->model
        Upload.base64DataUrl(file).then((base64Url) => {
            model.userUid = $rootScope.userDB.uid;
            const refImages = firebase.database().ref('images/');
            const imageList = $firebaseArray(refImages);
            const auxModel = {};
            const auxType = {};
            const modelKeys = model;
            var auxPrefix = {};
            //const auxType = {};
            imageList.$loaded().then(() => {
                imageList.$add(base64Url).then((imref) => {
                    //console.log("imref");
                    //console.log(imref)
                    model.imageFile = imref.key;
                    const ref = firebase.database().ref('models/');
                    const refDevComp = firebase.database().ref('devComp/');
                    const modelList = $firebaseArray(ref);
                    
                    refDevComp.on("value", (snapshot) => { // The whole object savedModels with all the saved models
                        console.log('prefix.toUpperCase(): ', prefix.toUpperCase());
                        console.log('snapshot.val(): ', snapshot.val());
                        if (prefix.toUpperCase() in snapshot.val()) {
                            if (type in snapshot.val()[prefix]) {
                                auxPrefix = snapshot.val();
                                auxPrefix[prefix][type] = model;
                                refDevComp.update(auxPrefix);
                                return;
                            }
                            else {
                                console.log('CREATE TYPE');
                                auxPrefix = snapshot.val();
                                auxPrefix[prefix][type] = '';
                                refDevComp.update(auxPrefix);
                                return;
                            }
                        }
                        else {
                            console.log('CREATE PREFIX');
                            auxPrefix[prefix] = '';
                            refDevComp.update(auxPrefix);
                            return;
                        }
                        // UPDATE ELEMENT
                        
                    });
                    
                    
                    //const devCompList = $firebaseArray(refDevComp);
                    modelKeys.prefixCompany = prefix;
                    modelKeys.type = type;
                    
                    /* $loaded function:
                     * Returns a promise which is resolved when the initial object data has been 
                     * downloaded from the database. The promise resolves to the $firebaseObject itself.
                     */
                    modelList.$loaded().then(() => {
                        console.log('MODEL: ', model);
                        auxType[type] = model;
                        auxModel[prefix] = auxType; // [prefix][type] can't be accessed on the fly
                        
                        console.log('AUX MODEL: ', auxModel);
                        /* $add function:
                         * Creates a new record in the database and adds the record to our 
                         * local synchronized array.
                         * This method returns a promise which is resolved after data has been 
                         * saved to the server. The promise resolves to the Firebase reference 
                         * for the newly added record, providing easy access to its key.
                         */
                        swal({
                            title: "It's been added with sucess!",
                            timer: 1700,
                            showConfirmButton: false
                        });
                        console.log('im here');
                        modelList.$add(modelKeys).then((ref) => {
                        });
                    });
                    
                    devCompList.$loaded().then(() => {
                        devCompList.$add(auxModel).then((refDevComp) => {
                        });
                    });
                });
            });
        });
    };
}]);