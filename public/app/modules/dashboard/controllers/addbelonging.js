
dashboard.controller("addbelongingController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseObject','$firebaseArray','Upload','$timeout','notification',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray, Upload, $timeout, notification) {
    const vm = this;
    function DatabaseException(message) {
        this.message = message;
        this.name = 'dbException';
     }
    vm.addbelonging = function (prefix, type, model, file) { // prefix->type->model
        Upload.base64DataUrl(file).then((base64Url) => {
            model.userUid = $rootScope.userDB.uid;
            var add = false;
            const refImages = firebase.database().ref('images/');
            const imageList = $firebaseArray(refImages);
            const auxModel = {};
            const auxType = {};
            const modelKeys = model;
            const auxInfo = {};
            var auxBind = {}; // devComp->prefix->type
            var auxBindPrefix = {}; // devComp->prefix
            var auxBindDevComp = {}; // devComp
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
                        //if ()
                        console.log('null: ', snapshot.val() == null);
                        if (snapshot.val() != null) {
                            if (prefix.toUpperCase() in snapshot.val()) {
                                if (type in snapshot.val()[prefix]) {
                                    auxInfo[(Object.keys(snapshot.val()[prefix][type]).length).toString()] = model;
                                    auxBind = Object.assign(snapshot.val()[prefix][type], auxInfo);
                                    auxPrefix[type] = auxBind;
                                    auxBindPrefix[prefix] = Object.assign(snapshot.val()[prefix], auxPrefix);
                                    auxBindDevComp = Object.assign(snapshot.val(), auxBindPrefix);
                                    console.log('auxBindDevComp: ', auxBindDevComp);
                                    
                                    if (add === false) {
                                        add = true;
                                        refDevComp.update(auxBindDevComp);
                                        console.log('type add: ', typeof add);
                                        console.log('type add: ', add);
                                    }

                                    /* Delete aux objects */
                                    for (const prop of Object.getOwnPropertyNames(auxInfo)) {
                                        delete auxInfo[prop];
                                    }
                                    for (const prop of Object.getOwnPropertyNames(auxType)) {
                                        delete auxType[prop];
                                    }
                                    for (const prop of Object.getOwnPropertyNames(auxBind)) {
                                        delete auxPrefix[prop];
                                    }                                
                                    for (const prop of Object.getOwnPropertyNames(auxPrefix)) {
                                        delete auxPrefix[prop];
                                    }
                                    for (const prop of Object.getOwnPropertyNames(auxBindPrefix)) {
                                        delete auxBindPrefix[prop];
                                    }
                                    debug += 1;
                                    return;
                                }
                                else { //ok
                                    console.log('CREATE TYPE');
                                    auxInfo['0'] = model; // First model of the just created type
                                    auxType[type] = auxInfo;
                                    auxPrefix[prefix] = Object.assign(snapshot.val()[prefix], auxType);
                                    refDevComp.update(auxPrefix);
                                    /* Delete aux objects */
                                    for (const prop of Object.getOwnPropertyNames(auxInfo)) {
                                        delete auxInfo[prop];
                                    }
                                    for (const prop of Object.getOwnPropertyNames(auxType)) {
                                        delete auxType[prop];
                                    }
                                    for (const prop of Object.getOwnPropertyNames(auxPrefix)) {
                                        delete auxPrefix[prop];
                                    }
                                    return;
                                }
                            }
                            else {
                                console.log('CREATE PREFIX');
                                auxType[type] = model;
                                auxPrefix[prefix] = auxType;
                                //refDevComp.update(auxPrefix);  

                                for (const prop of Object.getOwnPropertyNames(auxType)) {
                                    delete auxInfo[prop];
                                }
                                for (const prop of Object.getOwnPropertyNames(auxPrefix)) {
                                    delete auxType[prop];
                                }
                                return; 
                            } 
                        }
                        else {
                            throw new DatabaseException('Null Snapshot');
                        }
                    });
                    console.log('Outside if auxBindDevComp: ', auxBindDevComp);
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
                    
                    //devCompList.$loaded().then(() => {
                    //    devCompList.$add(auxModel).then((refDevComp) => {
                    //    });
                    //});
                });
            });
        });
    };
}]);
