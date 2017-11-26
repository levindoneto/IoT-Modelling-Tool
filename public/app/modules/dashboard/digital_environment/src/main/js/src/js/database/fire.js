import firebase from 'firebase'; // An installation via npm was needed

// Initialize Firebase
const config = {
    apiKey: 'AIzaSyDiFz4H5G6RkPhZMC5PJecNUeCAFUa0Rzs',
    authDomain: 'iot-mt.firebaseapp.com',
    databaseURL: 'https://iot-mt.firebaseio.com',
    projectId: 'iot-mt',
    storageBucket: 'iot-mt.appspot.com',
    messagingSenderId: '838147143079'
};

const fire = firebase.initializeApp(config);
export default fire;
