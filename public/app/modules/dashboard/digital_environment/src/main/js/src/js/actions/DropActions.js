import dispatcher from '../dispatcher';

/* Creates a device */
export function createDevice(device) {
    dispatcher.dispatch({
        type: 'CREATE_DEVICE',
        device,
    });
}

/* Deletes a device */
export function deleteDevice(id) {
    dispatcher.dispatch({
        type: 'DELETE_DEVICE',
        id
    });
}

/* Sets a property into a device */
export function setProperty(id, property, value, key) {
    dispatcher.dispatch({
        type: 'SET_PROPERTY',
        id,
        property,
        value,
        key
    });
}

/* Deletes a property into a device */
export function deleteProperty(id, property) {
    dispatcher.dispatch({
        type: 'DELETE_PROPERTY',
        id,
        property
    });
}

/* Saves and Loads models. It allows an user to see the model's
 * names that are available on the server */
export function getListOfModels() {
    // Call local backend API
}

/* Loads the selected model from the server into the frontend */
export function loadModel(id) {
    dispatcher.dispatch({
        type: 'LOAD_MODEL',
        id
    });
}

/* Saves the current frontend model to the server */
export function saveModel(title) {
    dispatcher.dispatch({
        type: 'SAVE_MODEL',
        title
    });
}

/* Loads the given model into the frontend model */
export function importModel(model) {
    dispatcher.dispatch({
        type: 'IMPORT_MODEL',
        model
    });
}

/* Exports the frontend model as file in a given format */
export function exportModel(format) {
    dispatcher.dispatch({
        type: 'EXPORT_MODEL',
        format
    });
}

/* Selects a device by the id */
export function selectDevice(id) {
    dispatcher.dispatch({
        type: 'SELECT_DEVICE',
        id
    });
}

/* Adds a type of device with a given id */
export function addDeviceType(id) {
    dispatcher.dispatch({
        type: 'ADD_DEVICE_TYPE',
        id
    });
}

/* Deletes all the devices from the view */
export function clearDevices() {
    dispatcher.dispatch({
        type: 'CLEAR_DEVICES'
    });
}

/* Shows the selected/set property to the user */
export function openSetProperty() {
    dispatcher.dispatch({
        type: 'OPEN_SET_PROPERTY'
    });
}

/* Closes the selected/set property to the user */
export function closeSetProperty() {
    dispatcher.dispatch({
        type: 'CLOSE_SET_PROPERTY'
    });
}
