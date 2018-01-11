
/* Function for updating devices with subsystems
 * @parameters: String: device, subsystem (both gotten from the current saved model),
 *                      location X, location Y
 *              Object: Properties of the subsystem 
 * @return: void, the function just updates the database
 */
function updateDevicesWithSubsystems(savedModel, device, subsystem, latitude, longitude, propertiesSubSystem, sensorValue, typeId, elementIndex) {
    const auxDevSub = {};
    const auxLoc = {};
    const auxIndex = {};
    const refDevicesWithSubsystems = firebase.database().ref(`devicesWithSubsystems/${savedModel}/${device}`);
    if (typeof sensorValue !== 'undefined') { // Device or Actuator
        auxLoc.value = sensorValue;
    }
    auxLoc['@type'] = typeId;
    auxLoc.locationX = latitude;
    auxLoc.locationY = longitude;
    auxDevSub[subsystem] = auxLoc;
    Object.assign(auxDevSub[subsystem], propertiesSubSystem);
    auxIndex[elementIndex] = auxDevSub;
    refDevicesWithSubsystems.update(auxIndex);
}

dashboard.controller('digitalenvironmentController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseArray', '$firebaseObject',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseArray, $firebaseObject) {
    const vm = this;
    const ref = firebase.database().ref('models/');
    const modelList = $firebaseArray(ref);
    modelList.$loaded().then(() => {
        $scope.models = modelList;
    });
    $scope.modal = function (model) {
        const refIcons = firebase.database().ref(`images/${model.imageFile}`);
        const imageObj = $firebaseObject(refIcons);
        imageObj.$loaded().then(() => {
            $scope.imagemodel = imageObj.$value;
            $scope.modalmodel = model;
        });
    };
}]);
