
dashboard.controller('mybelongingsController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseObject', '$firebaseArray',
    function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseObject, $firebaseArray) {
        var vm = this;
        const defaultCompDevProps = [
            'id',
            'imageFile',
            'ontology',
            'prefixCompany',
            'rdfsComment',
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
            //console.log("Model parameter: ", model);
            var ref = firebase.database().ref('images/' + model.imageFile);
            var imageObj = $firebaseObject(ref);
            imageObj.$loaded().then(() => {
                $scope.imagemodel = imageObj.$value;
                $scope.modalmodel = model;
            });
        };

        $scope.remove = function (accessKey, prefix, type, position) {
            //console.log('prefix: ', prefix);
            //console.log('type: ', type);
            //console.log('position: ', position);
            //console.log("Deleting...");
            for (var keyM in modelObj) {
                if (keyM.startsWith('-') && accessKey === modelObj[keyM].imageFile) {
                    var refM = firebase.database().ref(`models/${keyM}`);
                    var refDefComp = firebase.database().ref(`devComp/${prefix}/${type}/${position}`);
                    var modelObject = $firebaseObject(refM);
                    var dcObject = $firebaseObject(refDefComp);
                    //console.log('dcObject ', dcObject);
                    swal({
                        title: "Are you sure you wanna delete this device/component?",
                        text: "You can't change this once it's done!",
                        icon: "warning",
                        buttons: ["No", "Yes"],
                        dangerMode: true,
                    }).then((value) => { // yes:true, no:null
                            if (value == true) { // User has clicked the button <yes> for deleting the measurement
                                modelObject.$loaded().then(() => {
                                    modelObject.$remove().then(() => {
                                        swal({
                                            title: 'The device has been deleted with success!',
                                            timer: 1500,
                                            button: false,
                                            icon: 'success'
                                        });
                                    },
                                        (error) => {
                                            console.log('Error:', error);
                                        });
                                });
                                dcObject.$loaded().then(() => {
                                    dcObject.$remove().then(() => {
                                    },
                                        (error) => {
                                            console.log('Error:', error);
                                        });
                                });
                            }
                            else {
                                swal({
                                    title: "Your device hasn't been deleted!",
                                    timer: 1500,
                                    button: false
                                });
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
            //console.log('Key I: ', keyI);
            //console.log('model Obj: ', modelObj);
            for (var i in modelObj) {
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
                        //console.log('objAddPropsCompDev', objAddPropsCompDev);
                        $scope.objAddionalPropsCompDev = objAddPropsCompDev;
                    }, 0);
                }
            }
        };
    }]);
