
dashboard.controller('addbelongingController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseObject', '$firebaseArray', 'Upload',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray, Upload) {
    const vm = this;
    function DatabaseException(message) {
        this.message = message;
        this.name = 'dbException';
     }
    vm.addbelonging = function (prefix, type, model, file, pins) { // prefix->type->model
        // Update Map (component:specificType)
        const mapTypeComponents = firebase.database().ref('mapTypeComponents/');
        const compType = {};
        const pinsObj = {}; // Devices: numberOfPins, Components: pinConfiguration
        const valueObj = {};
        const gpioModeObj = {};
        const modelNumberObj = {};
        pinsObj.NewPropertyOwlType = 'owl:Restriction';
        pinsObj.NewPropertyType = 'xsd:nonNegativeInteger';
        pinsObj.NewPropertyValue = pins;

        if (type === 'ActuatingDevice') {
            compType[model.id] = 'actuator';
        } else if (type === 'SensingDevice') {
            compType[model.id] = 'sensor';
            valueObj.NewPropertyOwlType = 'owl:Restriction';
            valueObj.NewPropertyType = 'xsd:string';
            valueObj.NewPropertyValue = '-';
        } else {
            compType[model.id] = 'device';
            gpioModeObj.NewPropertyOwlType = 'owl:DatatypeProperty';
            gpioModeObj.NewPropertyType = 'xsd:string';
            gpioModeObj.NewPropertyValue = '';
            modelNumberObj.NewPropertyOwlType = 'owl:DatatypeProperty';
            modelNumberObj.NewPropertyType = 'xsd:string';
            modelNumberObj.NewPropertyValue = '';
        }
        mapTypeComponents.update(compType);
        Upload.base64DataUrl(file).then((base64Url) => {
            model.userUid = $rootScope.userDB.uid; // User who has added the model into the platform
            model.ontology = type === 'ActuatingDevice' ? 'iot-lite' : 'ssn'; // Sensors and Devices have ssn as their ontologies
            const refImages = firebase.database().ref('images/');
            const imageList = $firebaseArray(refImages);
            const auxType = {};
            const modelKeys = model;
            const auxInfo = {};
            const auxPrefix = {};
            const auxBindPrefix = {}; // devComp->prefix
            let add = false;
            let auxBind = {}; // devComp->prefix->type
            let auxBindDevComp = {}; // devComp
            imageList.$loaded().then(() => { // Add icon
                imageList.$add(base64Url).then((imref) => {
                    model.imageFile = imref.key;
                    const ref = firebase.database().ref('models/');
                    const refDevComp = firebase.database().ref('devComp/');
                    const modelList = $firebaseArray(ref);
                    refDevComp.on('value', (snapshot) => { // The whole object savedModels with all the saved models
                        if (snapshot.val() != null) {
                            if (prefix in snapshot.val() && add === false) {
                                if (type in snapshot.val()[prefix]) {
                                    auxInfo[concatenate((Object.keys(snapshot.val()[prefix][type]).length).toString(), '-', model.id)] = model;                                   
                                    auxBind = Object.assign(snapshot.val()[prefix][type], auxInfo);
                                    auxPrefix[type] = auxBind;
                                    auxBindPrefix[prefix] = Object.assign(snapshot.val()[prefix], auxPrefix);
                                    auxBindDevComp = Object.assign(snapshot.val(), auxBindPrefix);
                                    // Condition for avoiding multiple addings in the database with the same element
                                    const keyPrevious = Object.keys(snapshot.val()[prefix][type])[(Object.keys(snapshot.val()[prefix][type]).length - 1).toString()];
                                    if (add === false && snapshot.val()[prefix][type][keyPrevious].id !== model.id) {
                                        refDevComp.update(auxBindDevComp);
                                        add = true;
                                        return;
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
                                    add = true;
                                    return;
                                } else { // If type has not been defined
                                    // Create type
                                    auxInfo[concatenate('0', '-', model.id)] = model; // First model of the just created type
                                    auxType[type] = auxInfo;
                                    auxPrefix[prefix] = Object.assign(snapshot.val()[prefix], auxType);
                                    refDevComp.update(auxPrefix);
                                    add = true;
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
                                    add = true;
                                    return;
                                }
                            } else { // If prefix has not been defined
                                // Create prefix
                                // First model of the just created type
                                auxInfo[concatenate('0', '-', model.id)] = model;
                                auxType[type] = auxInfo;
                                auxPrefix[prefix] = auxType;
                                refDevComp.update(auxPrefix);
                                add = true;  
                                for (const prop of Object.getOwnPropertyNames(auxType)) {
                                    delete auxInfo[prop];
                                }
                                for (const prop of Object.getOwnPropertyNames(auxPrefix)) {
                                    delete auxType[prop];
                                }
                                return; 
                            } 
                        } else {
                            throw new DatabaseException('Null Snapshot');
                        }
                    });
                    modelKeys.prefixCompany = prefix;
                    modelKeys.type = type;
                    if (type === 'Device') {
                        model.numberOfPins = pinsObj;
                        model.gpioMode = gpioModeObj;
                        model.modelNumber = modelNumberObj;
                    } else if (type === 'SensingDevice') {
                        model.pinConfiguration = pinsObj;
                        model.value = valueObj;
                    } else {
                        model.pinConfiguration = pinsObj;
                    }
                    /* $loaded function:
                     * It returns a promise, which is resolved when the initial object data  
                     * has been downloaded from the database. The promise resolves to the 
                     * $firebaseObject itself. */
                    modelList.$loaded().then(() => {
                        /* $add function:
                         * It creates a new record in the database and it adds the record to a 
                         * local synchronized array.
                         * This method returns a promise, which is resolved after the data has been 
                         * saved to the server. The promise resolves to the Firebase reference 
                         * for the newly added record, providing an easy access to its key. */
                        swal({
                            title: concatenate('Thse ', compType[model.id], ' has been added successfully!\n'),
                            icon: 'success',
                            button: false,
                            timer: 3000
                        });
                        modelList.$add(modelKeys).then((ref) => {
                            console.log('Reference of the added ', type, ':\n', ref.toString());
                        });
                        setTimeout(() => {
                            routeSync();
                        }, 3000); 
                    });
                });
            });
        });
    };
}]);
