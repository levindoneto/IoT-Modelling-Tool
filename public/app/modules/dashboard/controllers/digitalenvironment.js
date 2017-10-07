/* Function for updating the devices with its subsystems
 * @parameters: String: device, subsystem (both gotten from the current saved model),
 *                      location X, location Y
 *              Object: Properties of the subsystem 
 * @return: void, the function just updates the database
 */
function updateDevicesWithSubsystems(savedModel, device, subsystem, latitude, longitude, propertiesSubSystem, sensorValue) { //add current one
    // pass the value here if it's a sensor

    //console.log('subsystem: ', '---', propertiesSubSystem);
    console.log('value: ', sensorValue, 'at the subsystem: ', subsystem); // ok
    const auxDevSub = {};
    const auxLoc = {};
    const refDevicesWithSubsystems = firebase.database().ref(`devicesWithSubsystems/${savedModel}/${device}`);
    auxLoc.value = sensorValue; // DON'T PUT THIS FOR ACTUATORS...
    auxLoc.locationX = latitude;
    auxLoc.locationY = longitude;
    auxDevSub[subsystem] = auxLoc;
    console.log('aux dev: ', auxDevSub); //it's wrong...
    console.log('propertiesSubSystem: ', propertiesSubSystem);
    Object.assign(auxDevSub[subsystem], propertiesSubSystem);
    refDevicesWithSubsystems.update(auxDevSub);
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
