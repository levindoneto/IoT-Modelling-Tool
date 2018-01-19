dashboard.controller(
    'mybelongingsController', [
        '$rootScope',
        '$scope',
        '$state',
        '$location',
        'dashboardService',
        'Flash',
        '$firebaseObject',
        '$firebaseArray',
        function (
            $rootScope,
            $scope,
            $state,
            $location,
            dashboardService,
            Flash,
            $firebaseObject,
            $firebaseArray
        ) {
            const vm = this;
            const defaultCompDevProps = [
                'imageFile',
                'prefixCompany',
                'type',
                'userUid'
            ];
            const ref = firebase.database().ref('models/');
            const refDC = firebase.database().ref('devComp/');
            const modelList = $firebaseArray(ref);
            const modelObj = $firebaseObject(ref);
            const devCompList = $firebaseArray(refDC);
            modelList.$loaded().then(() => {
                $scope.models = modelList; // Information of devices and components
            });
            devCompList.$loaded().then(() => {
                $scope.devComps = devCompList; // Nested elements prefix->type->key_models->details
            });

            function verifyAdditionalPropertyCompDev(elementPropertyI) {
                let thisIsAdditionalProperty = true; // It is false just if the property has been found in the default properties' list
                for (let prop = 0; prop < defaultCompDevProps.length; prop++) {
                    if (
                        elementPropertyI.toUpperCase() ===
                        defaultCompDevProps[prop].toUpperCase()
                    ) {
                        // The property is a default one
                        thisIsAdditionalProperty = false; // This means propertyI is in the list of default properties
                    }
                }
                return thisIsAdditionalProperty;
            }

            $scope.modal = function (model) {
                const refIcons = firebase.database().ref(`images/${model.imageFile}`);
                const imageObj = $firebaseObject(refIcons);
                imageObj.$loaded().then(() => {
                    $scope.imagemodel = imageObj.$value;
                    $scope.modalmodel = model;
                });
            };

            $scope.remove = function (accessKey, prefix, type, position) {
                const refDefComp = firebase.database().ref(`devComp/${prefix}/${type}/`);
                let keyM;
                let typeLC; // actuator, device or sensor
                switch (type) {
                    case 'ActuatingDevice':
                        typeLC = 'actuator';
                        break;
                    case 'Device':
                        typeLC = 'device';
                        break;
                    case 'SensingDevice':
                        typeLC = 'sensor';
                        break;
                    default:
                        typeLC = 'device';
                }
                for (keyM in modelObj) {
                    if (keyM.startsWith('-') && accessKey === modelObj[keyM].imageFile) {
                        const refM = firebase.database().ref(`models/${keyM}`);
                        const refMapTypeComponents = firebase
                            .database()
                            .ref(`mapTypeComponents/${modelObj[keyM].id}`);
                        const refIcons = firebase
                            .database()
                            .ref(`images/${modelObj[keyM].imageFile}`);
                        swal({
                            title: concatenate(
                                'Are you sure you wanna delete this ',
                                typeLC,
                                '?'
                            ),
                            text: 'You can not change this once it is done!',
                            icon: 'warning',
                            buttons: ['No', 'Yes'],
                            dangerMode: true
                        }).then(value => {
                            // yes:true, no:null
                            if (value) {
                                // User has clicked the button <yes> for deleting the measurement
                                refIcons.remove();
                                refMapTypeComponents.remove();
                                refM.remove();
                                refDefComp.child(position.toString()).remove();
                                swal({
                                    title: concatenate('The ', typeLC, ' has been deleted!'),
                                    icon: 'success',
                                    button: false,
                                    timer: 3000
                                });
                            } else {
                                swal({
                                    title: concatenate('The ', typeLC, ' has not been deleted!'),
                                    icon: 'success',
                                    button: false,
                                    timer: 3000
                                });
                            }
                        });
                    }
                }
                setTimeout(() => {
                    routeSync();
                }, 3000);
            };

            /* Function for getting all device/components' information with the access key from the element on devComp
            * @parameters: String: Access key
            * @return: Object element: information of the device or component
            */
            $scope.getInfo = function (keyI) {
                let i;
                for (i = 0; i < Object.keys(modelObj).length; i++) {
                    if (
                        Object.keys(modelObj)[i].startsWith('-') &&
                        keyI === modelObj[Object.keys(modelObj)[i]].imageFile
                    ) {
                        // Access the object context selected by the user
                        const refKey = firebase
                            .database()
                            .ref(`models/${Object.keys(modelObj)[i]}`);
                        const compDevObj = $firebaseObject(refKey);
                        const objAddPropsCompDev = {};
                        setTimeout(() => {
                            for (const compDevPropI in compDevObj) {
                                // Range on the object @context->key
                                if (compDevObj.hasOwnProperty(compDevPropI)) {
                                    // This will check all properties' names on database's key
                                    const isAddCompDevProperty = verifyAdditionalPropertyCompDev(
                                        compDevPropI
                                    );
                                    // Additional info has been found
                                    if (isAddCompDevProperty === true) {
                                        // Update the object with a new pair key:value
                                        objAddPropsCompDev[compDevPropI] = compDevObj[compDevPropI];
                                    }
                                }
                            }
                            $scope.objAddionalPropsCompDev = objAddPropsCompDev;
                        }, 0);
                    }
                }
            };
        }
    ]
);
