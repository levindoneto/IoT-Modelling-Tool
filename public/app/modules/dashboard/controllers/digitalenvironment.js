console.log('Triggering ...');
const refTrig = firebase.database().ref('devicesWithSubsystems/');
refTrig.on("child_changed", (snapshot) => {
    console.log('Something has changed on the saved model: ', snapshot.key); // key() for older firebase versions 
    console.log('The changed element: ', snapshot.val());

});

/* Function for updating the devices with its subsystems
 * @parameters: String: device, subsystem (both gotten from the current saved model),
 *                      location X, location Y
 *              Object: Properties of the subsystem 
 * @return: void, the function just updates the database
 */
function updateDevicesWithSubsystems(savedModel, device, subsystem, latitude, longitude, propertiesSubSystem, sensorValue, typeId, elementIndex) { //add current one
    const auxDevSub = {};
    const auxLoc = {};
    const auxIndex = {};
    const refDevicesWithSubsystems = firebase.database().ref(`devicesWithSubsystems/${savedModel}/${device}`);
    if (typeof sensorValue !== 'undefined') { // device or actuator
        auxLoc.value = sensorValue;
    }
    auxLoc.index = elementIndex;
    auxLoc['@type'] = typeId;
    auxLoc.locationX = latitude;
    auxLoc.locationY = longitude;
    auxDevSub[subsystem] = auxLoc;
    Object.assign(auxDevSub[subsystem], propertiesSubSystem);
    auxIndex[elementIndex] = auxDevSub;
    refDevicesWithSubsystems.update(auxIndex);
}

dashboard.controller("digitalenvironmentController", ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash','$firebaseArray','$firebaseObject','notification',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseArray, $firebaseObject, notification) {
    var vm = this;

    var ref = firebase.database().ref('models/');
    var modelList = $firebaseArray(ref);
    modelList.$loaded().then(() => {
        //console.log(modelList)
        $scope.models = modelList;
    });

      $scope.modal = function (model) {
          var ref = firebase.database().ref(`images/${model.imageFile}`);
          var imageObj = $firebaseObject(ref);
          imageObj.$loaded().then(function(){
              //console.log("image");
              //console.log(imageObj)
              $scope.imagemodel = imageObj.$value;
              $scope.modalmodel = model;
              //console.log($scope.modalmodel);
          });
      }
    }]);
