dashboard.controller(
    'searchController', [
        '$rootScope',
        '$scope',
        '$state',
        '$location',
        'dashboardService',
        'Flash',
        '$firebaseArray',
        'notification',
        '$firebaseObject',
        function (
            $rootScope,
            $scope,
            $state,
            $location,
            dashboardService,
            Flash,
            $firebaseArray,
            notification,
            $firebaseObject
        ) {
            const vm = this;

            $scope.search = function (query) {
                $scope.searchItem = query;
                const ref = firebase.database().ref('models/');
                const modelList = $firebaseArray(ref);
                modelList.$loaded().then(() => {
                    $scope.models = modelList; // All the defined devices and components
                });
            };

            $scope.modal = function (model) {
                const refIcons = firebase.database().ref(`images/${model.imageFile}`);
                const imageObj = $firebaseObject(refIcons);
                imageObj.$loaded().then(() => {
                    $scope.imagemodel = imageObj.$value;
                    $scope.modalmodel = model;
                });
            };

            $scope.modalUserDetail = function (model) {
                const refUsers = firebase.database().ref(`users/${model.userUid}`);
                const userDetail = $firebaseObject(refUsers);
                userDetail.$loaded().then(() => {
                    $scope.modaluser = userDetail;
                });
            };
        }
    ]
);