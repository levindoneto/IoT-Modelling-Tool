import React from 'react';
import ReactDOM from 'react-dom';
import DragAroundNaive from './components/DragAroundNaive';
import injectTapEventPlugin from 'react-tap-event-plugin';

import fire from './database/fire' // Database to be accessed for this part of the application
import reactfire from 'reactfire' // Binding between the database and reactjs

var allIcons = {}; //Object with the icons of the devices (basis 64)

const lstComponenents = {
    device: [], // list_infos_devices.type == "device"
    sensor: [], // list_infos_devices.type == "sensor"
    actuator: [], // list_infos_devices.type == "actuator"
};

const one_id_random = "RaspberryPiTwo"

function Component(element) {
    this.numberOfPins = element.NumberOfPins;
    this.id = element.id;
    this.iconComponentKey = element.imageFile; // This key is used to access the correct image in the another data structure
    this.ownerUser = element.userUid;
}

function createComponent(element) {
    /* if element.type is definied */
    return lstComponenents[element.type].push(new Component(element)); // returns a promise
}

// Reading data from the database (key: images)
firebase.database().ref("images").orderByKey().once("value")
.then(function(snapshot) { // after function(snapshot)
    snapshot.forEach(function(childSnapshot) {
        allIcons[childSnapshot.key] = childSnapshot.val();
    });
});
// Reading data from the database (key: "models")
firebase.database().ref("models").orderByKey().once("value")
.then(function(snapshot) { // after function(snapshot)
    snapshot.forEach(function(childSnapshot) {  // Loop into database's information
    //var key = childSnapshot.key;
        switch (childSnapshot.val().type) {
            case "device":
                createComponent(childSnapshot.val());
                break;
            case "sensor":
                createComponent(childSnapshot.val());
                break;
            case "actuator":
                createComponent(childSnapshot.val());
                break;
            default:
                createComponent(childSnapshot.val());
        }
    });
}).then(function(createComponent) {
    //var global = "across";
    //localStorage.setItem('text', lstComponenents.device["0"].id);
    console.log("THEN (IN CLIENT) ", lstComponenents.actuator["0"].id); // Now the value isn't undefined
    var prefixIPVS = "ipvs:";
    var deviceOne = lstComponenents.device["0"].id;
    var sensorOne = lstComponenents.sensor["0"].id;
    var actuatorOne = lstComponenents.actuator["0"].id;
    localStorage.setItem('device', deviceOne);
    localStorage.setItem('sensor', sensorOne);
    localStorage.setItem('actuator', actuatorOne);
    //localStorage.setItem('prefixIPVS', prefixIPVS);
    
    const rootEl = document.getElementById('root');
    window.boxes = []

    injectTapEventPlugin();
    ReactDOM.render(
     <DragAroundNaive />,
     rootEl
    );
});
