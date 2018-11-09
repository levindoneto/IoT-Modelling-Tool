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
            routeSync();
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




            $scope.modal = function (model) {
                const refIcons = firebase.database().ref(`images/${model.imageFile}`);
                const imageObj = $firebaseObject(refIcons);
                imageObj.$loaded().then(() => {
                    $scope.imagemodel = imageObj.$value;
                    $scope.modalmodel = model;
                });
            };

           
            /* Function for getting all device/components' information with the access key from the element on devComp
            * @parameters: String: Access key
            * @return: Object element: information of the device or component
            */

            $scope.getInfo = function (id) {
                const refUser = firebase.database().ref(`users/${id}`);
                    const user = $firebaseObject(refUser);
                   return user.Username;

            };
        }
    ]
);
