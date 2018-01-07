
dashboard.controller('mybelongingsController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseObject', '$firebaseArray',
    function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) {
        var vm = this;
        const defaultCompDevProps = [
            'imageFile',
            'prefixCompany',
            'type',
            'userUid'];
        var ref = firebase.database().ref('models/');
        var refDC = firebase.database().ref('devComp/');
        var modelList = $firebaseArray(ref);
        var modelObj = $firebaseObject(ref);
        var devCompList = $firebaseArray(refDC);
        modelList.$loaded().then(() => {
            $scope.models = modelList; // Information of devices and components
        });
        devCompList.$loaded().then(() => {
            $scope.devComps = devCompList; // Nested elements prefix->type->key_models
        });

        function verifyAdditionalPropertyCompDev(elementPropertyI) {
            let thisIsAdditionalProperty = true; // It'll be false just if the property has be found in the default properties' list
            for (let prop = 0; prop < defaultCompDevProps.length; prop++) {
                if (elementPropertyI.toUpperCase() === defaultCompDevProps[prop].toUpperCase()) { // the property is a default one
                    thisIsAdditionalProperty = false; // This means property_i is in the list of default properties
                }
                else {
                    continue; // Don't set the variable up to one because all the list of default properties ought to be checked
                }
            }
            return thisIsAdditionalProperty;
        }

        $scope.modal = function (model) {
            var ref = firebase.database().ref(`images/${model.imageFile}`);
            var imageObj = $firebaseObject(ref);
            imageObj.$loaded().then(() => {
                $scope.imagemodel = imageObj.$value;
                $scope.modalmodel = model;
            });
        };

        $scope.remove = function (accessKey, prefix, type, position) {
            let keyM;
            let typeLC; // actuator, device or sensor
            const refDefComp = firebase.database().ref(`devComp/${prefix}/${type}/`);
            
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
                    const refMapTypeComponents = firebase.database().ref(`mapTypeComponents/${modelObj[keyM].id}`);
                    const refIcons = firebase.database().ref(`images/${modelObj[keyM].imageFile}`);
                    swal({
                        title: concatenate('Are you sure you wanna delete this ', typeLC, '?'),
                        text: 'You can not change this once it is done!',
                        icon: 'warning',
                        buttons: ['No', 'Yes'],
                        dangerMode: true,
                    }).then((value) => { // yes:true, no:null
                            if (value) { // User has clicked the button <yes> for deleting the measurement
                                console.log('modelObj[keyM].imageFile: ', modelObj[keyM].imageFile);
                                refIcons.remove();
                                refMapTypeComponents.remove();
                                refM.remove();
                                refDefComp.child(position.toString()).remove();
                            }
                            else {
                                swal({
                                    title: concatenate('The ', typeLC, ' has not been deleted!'),
                                    icon: 'success',
                                    button: false,
                                    timer: 3000
                                });
                                setTimeout(() => {
                                    routeSync();
                                }, 3000); 
                            }
                        });
                }
            }
        };

        /* Function for getting all device/components' information with the access key from the element on devComp
         * @parameters: String: Access key
         * @return: Object element: information of the device or component
         */
        $scope.getInfo = function (keyI) {
            let i;
            for (i in modelObj) {
                if (i.startsWith('-') && keyI === modelObj[i].imageFile) {
                    let ref = firebase.database().ref(`models/${i}`); // Accesing the object context selected by the user
                    let compDevObj = $firebaseObject(ref);
                    const objAddPropsCompDev = {};
                    setTimeout(() => {
                        for (const compDevPropI in compDevObj) { // Ranging on the object @context->key
                            if (compDevObj.hasOwnProperty(compDevPropI)) { // This will check all properties' names on database's key
                                const isAddCompDevProperty = verifyAdditionalPropertyCompDev(compDevPropI);
                                if (isAddCompDevProperty === true) { // Additional info has been found
                                    objAddPropsCompDev[compDevPropI] = compDevObj[compDevPropI]; // Updating the object with a new pair key:value
                                }
                            }
                        }
                        $scope.objAddionalPropsCompDev = objAddPropsCompDev;
                    }, 0);
                }
            }
        };
    }]);
