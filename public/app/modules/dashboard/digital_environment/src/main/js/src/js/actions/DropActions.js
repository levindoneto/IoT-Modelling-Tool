import dispatcher from '../dispatcher';
import * as backend from '../backend/backend';

/* Create a device */
export function createDevice(device) {
    dispatcher.dispatch({
        type: 'CREATE_DEVICE',
        device,
    });
}

/* Delete a device */
export function deleteDevice(id) {
    dispatcher.dispatch({
        type: 'DELETE_DEVICE',
        id
    });
}

/* Set a property into a device */
export function setProperty(id, property, value, key) {
    dispatcher.dispatch({
        type: 'SET_PROPERTY',
        id,
        property,
        value,
        key
    });
}

/* Delete a property into a device */
export function deleteProperty(id, property) {
    dispatcher.dispatch({
        type: 'DELETE_PROPERTY',
        id,
        property
    });
}

/* Load the selected model from the server into the frontend */
export function loadModel(id) {
    dispatcher.dispatch({
        type: 'LOAD_MODEL',
        id
    });
}

/* Save the current frontend model to the server */
export function SaveModelAs(title) {
    dispatcher.dispatch({
        type: 'SAVE_MODEL_AS',
        title
    });
}

/* Load the given model into the frontend model */
export function importModel(model) {
    dispatcher.dispatch({
        type: 'IMPORT_MODEL',
        model
    });
}

/* Export the frontend model as file in a given format */
export function exportModel(format) {
    dispatcher.dispatch({
        type: 'EXPORT_MODEL',
        format
    });
}

/* Select a device by the id */
export function selectDevice(id) {
    dispatcher.dispatch({
        type: 'SELECT_DEVICE',
        id
    });
}

/* Add a type of device with a given id */
export function addDeviceType(id) {
    dispatcher.dispatch({
        type: 'ADD_DEVICE_TYPE',
        id
    });
}

/* Delete all the devices from the view */
export function clearDevices() {
    if (backend.isDigitalTwinEmpty()) {
        localStorage.setItem('digitalTwinWasEmpty', 'true');
    } else { // The model in the digital twin has already been cleaned
        localStorage.setItem('digitalTwinWasEmpty', 'false');
    }
    dispatcher.dispatch({
        type: 'CLEAR_DEVICES'
    });
}

/* Show the selected/set property to the user */
export function openSetProperty() {
    dispatcher.dispatch({
        type: 'OPEN_SET_PROPERTY'
    });
}

/* Close the selected/set property to the user */
export function closeSetProperty() {
    dispatcher.dispatch({
        type: 'CLOSE_SET_PROPERTY'
    });
}
