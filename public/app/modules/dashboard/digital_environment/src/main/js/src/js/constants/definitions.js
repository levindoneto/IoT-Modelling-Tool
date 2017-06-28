import fire from '../database/fire' // Database to be accessed for this part of the application
import reactfire from 'reactfire' // Binding between the database and reactjs

//var prefixIPVS = require('./client').default;
//console.log("PREFIX ON DEFINITIONS: ", prefixIPVS);
//var prefixIPVS = localStorage.getItem('prefixIPVS');
var deviceOne = localStorage.getItem('device');
var sensorOne = localStorage.getItem('sensor');
var actuatorOne = localStorage.getItem('actuator');
console.log("STORED VALUE DEVICE ONE: ", localStorage.getItem('device'));


// Retrieving the object from the local storage
var retrievedObject = localStorage.getItem('defObject');
var definitions = JSON.parse(retrievedObject);
//console.log('retrievedObject: ', JSON.parse(retrievedObject));

export {definitions};
