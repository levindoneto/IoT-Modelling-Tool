
dashboard.controller("addbelongingController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray','Upload','$timeout','notification',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray, Upload, $timeout, notification) {
    const vm = this;
    function getOut() {
        console.log('Getting out...');
        return -1;
    }
    vm.addbelonging = function (prefix, type, model, file) { // prefix->type->model
        Upload.base64DataUrl(file).then((base64Url) => {
            model.userUid = $rootScope.userDB.uid;
            const refImages = firebase.database().ref('images/');
            const imageList = $firebaseArray(refImages);
            const auxModel = {};
            const auxType = {};
            const modelKeys = model;
            const auxInfo = {};
            var auxBind = {};
            var auxPrefix = {};
            imageList.$loaded().then(() => {
                imageList.$add(base64Url).then((imref) => {
                    //console.log("imref");
                    //console.log(imref)
                    model.imageFile = imref.key;
                    const ref = firebase.database().ref('models/');
                    const refDevComp = firebase.database().ref('devComp/');
                    const modelList = $firebaseArray(ref);
                    let debug = 0;
                    refDevComp.on("value", (snapshot) => { // The whole object savedModels with all the saved models
                        console.log('DEBUG (0): ', debug);
                        //console.log('prefix.toUpperCase(): ', prefix.toUpperCase());
                        //console.log('snapshot.val(): ', snapshot.val());
                        if (prefix.toUpperCase() in snapshot.val()) {
                            if (type in snapshot.val()[prefix]) {
                                auxInfo[(Object.keys(snapshot.val()[prefix][type]).length).toString()] = model;
                                auxType[type] = '';
                                auxBind[prefix] = auxType;
                                auxBind[prefix][type] = Object.assign(auxInfo, snapshot.val()[prefix][type]);              
                                //auxPrefix = snapshot.val();
                                //auxPrefix[prefix][type] = auxInfo;
                                refDevComp.update(auxBind[prefix][type]);
                                return;
                            }
                            else {
                                console.log('CREATE TYPE');
                                auxInfo['0'] = model; // First model of the just created type
                                auxType[type] = auxInfo;
                                auxPrefix[prefix] = Object.assign(snapshot.val()[prefix], auxType);
                                refDevComp.update(auxPrefix);
                                return;
                            }
                        }
                        else {
                            console.log('CREATE PREFIX');
                            debug += 1;
                            console.log('DEBUG ELSE (1): ', debug);
                            auxType[type] = model;
                            auxPrefix[prefix] = auxType;
                            refDevComp.update(auxPrefix);  
                            getOut(); 
                            return; 
                        }
                    });
                    
                    //const devCompList = $firebaseArray(refDevComp);
                    modelKeys.prefixCompany = prefix;
                    modelKeys.type = type;
                    
                    /* $loaded function:
                     * Returns a promise which is resolved when the initial object data has been 
                     * downloaded from the database. The promise resolves to the $firebaseObject itself.
                     */
                    modelList.$loaded().then(() => {
                        //console.log('MODEL: ', model);
                        auxType[type] = model;
                        auxModel[prefix] = auxType; // [prefix][type] can't be accessed on the fly
                        
                        //console.log('AUX MODEL: ', auxModel);
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
                        //console.log('im here');
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