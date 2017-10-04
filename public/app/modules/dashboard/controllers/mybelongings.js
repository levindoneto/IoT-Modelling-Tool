
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
                //console.log("image");
                //console.log(imageObj)
                $scope.imagemodel = imageObj.$value;
                $scope.modalmodel = model;
                //console.log("ONE IMAGE FROM THE DATABASE::: ", $scope.imagemodel);
            });
        };

        $scope.remove = function (model) {
            //console.log("Deleting...");
            var modelID = model.$id;
            //console.log(modelID);
            var ref = firebase.database().ref('models/' + model.$id);
            var modelObject = $firebaseObject(ref);

            swal({
                title: 'Are you sure you wanna delet this device/component?',
                text: "You can't change this after!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: "Yes, I'm sure!",
                cancelButtonText: 'No, cancel!',
                closeOnConfirm: false,
                closeOnCancel: false
            },
                (isConfirm) => {
                    if (isConfirm) {
                        modelObject.$loaded().then(() => {
                            modelObject.$remove().then(() => {
                                swal({
                                    title: 'The device has been deleted with success!',
                                    timer: 1500,
                                    showConfirmButton: false
                                });
                            },
                                (error) => {
                                    console.log('Error:', error);
                                });
                        });
                    } else {
                        swal({
                            title: "Your device hasn't been deleted!",
                            timer: 1500,
                            showConfirmButton: false
                        });
                    }
                });
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
