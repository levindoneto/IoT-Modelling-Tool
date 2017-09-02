import reactfire from 'reactfire'; // Binding between the database and reactjs
import fire from '../database/fire'; // Database to be accessed for this part of the application

// Retrieving the object from the local storage
const retrievedObject = localStorage.getItem('upDefinitions');
const definitions = JSON.parse(retrievedObject);
//console.log('retrievedObject: ', JSON.parse(retrievedObject));

export { definitions };
