import firebase from 'firebase'; // An installation via npm was needed

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDiFz4H5G6RkPhZMC5PJecNUeCAFUa0Rzs",
    authDomain: "iot-mt.firebaseapp.com",
    databaseURL: "https://iot-mt.firebaseio.com",
    projectId: "iot-mt",
    storageBucket: "iot-mt.appspot.com",
    messagingSenderId: "838147143079"
};

let fire = firebase.initializeApp(config);
export default fire;
