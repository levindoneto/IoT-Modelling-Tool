import dispatcher from "../dispatcher";

// ##### Create and modify Devices ############################################

export function createDevice(device) {
  dispatcher.dispatch({
    type: "CREATE_DEVICE",
    device,
  });
}

export function deleteDevice(id) {
  dispatcher.dispatch({
    type: "DELETE_DEVICE",
    id
  })
}

export function setProperty(id, property, value) {
  dispatcher.dispatch({
    type: "SET_PROPERTY",
    id,
    property,
    value
  })
}

export function getPropertiesFromDeviceBlueprint(deviceType) {
    dispatcher.dispatch({
        type: "GET_PROPERTIES_FROM_DEVICE_BLUEPRINT",
        deviceType
    })
}

// ##### Save and load whole Models ###########################################
// allows user to see the model names which are available on the server
export function getListOfModels() {
    // call local backend API
}

// loads the selected model from the server to the frontend
export function loadModel(id) {
    dispatcher.dispatch({
        type: "LOAD_MODEL",
        id
    })
}

// saves the frontend model to the server
export function saveModel(title) {
    dispatcher.dispatch({
        type: "SAVE_MODEL",
        title
    })
}

// loads the given model to the frontend model
export function importModel(model) {
    dispatcher.dispatch({
        type: "IMPORT_MODEL",
        model
    })
}

// exports the frontend model as file in given format
export function exportModel(format) {
    dispatcher.dispatch({
        type: "EXPORT_MODEL",
        format
    })
}
