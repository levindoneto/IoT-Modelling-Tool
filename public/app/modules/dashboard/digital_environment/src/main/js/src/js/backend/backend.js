import DeviceStore from '../stores/DeviceStore';
import {
    definitions
} from '../constants/definitions';

const RESTAPIADDRESS = 'http://192.168.209.189:8080/MBP';
const TRUE = 'true';
const FALSE = 'false';
const LOAD_LAST_MODEL = 'loadLastModel';
const IS_SYNC = 'isSync';
/* Flag for knowing when the platform is just being syncrhonized
 * in order to not set a model during this process */
const PREFIX = 'prefix';
const auxSavedModels = {};
const auxContent = {};
const refTrig = firebase.database().ref('devicesWithSubsystems/');
const refSavedModels = firebase.database().ref('savedModels/');
const refTmp = firebase.database().ref('tmp/');
const refInfoSaved = firebase.database().ref('infoSavedModels');
const USER_MODEL = 'userModel';
const PIN_CONF = 'pinConfiguration';
const defaultContentProps = [ // properties that will not be parsed
    'geo:location',
    '@id',
    'iot-lite:isSubSystemOf',
    concatenate(localStorage.getItem(PREFIX), ':value'),
    '@type'
];
var adapters = {};
let accessedModel = {};
// Trigger for modifications in the devices with subsystems
refTrig.on('child_changed', (snapshot) => {
    refInfoSaved.on('value', (info) => {
        // Update de database just if the edited model is loaded in the digital twin
        if (snapshot.key === info.val().lastLoadedModel) {
            refSavedModels.on('value', (savedM) => {
                accessedModel = JSON.parse(savedM.val()[snapshot.key].content);
                localStorage.setItem(USER_MODEL, savedM.val()[snapshot.key].user);
                let i;
                let j;
                let k;
                for (i = 0; i < (Object.keys(accessedModel[['@graph']])).length; i++) {
                    for (j in snapshot.val()) {
                        for (k in snapshot.val()[j]) {
                            if (i.toString() === k.toString()) {
                                if (isNaN(parseInt(snapshot.val()[j][k][Object.keys(snapshot.val()[j][k])[0]].locationY, 10)) ||
                                    isNaN(parseInt(snapshot.val()[j][k][Object.keys(snapshot.val()[j][k])[0]].locationX, 10))
                                ) {
                                    // Reload the previous value into the database's element, which has a correct type
                                    fireAjaxSave(snapshot.key, JSON.parse(savedM.val()[snapshot.key].content), false, true, false);
                                    console.log('Problem of type:\nLocations shall be in a format of a number');
                                    return;
                                } else {
                                    accessedModel['@graph'][i][concatenate(localStorage.getItem(PREFIX), ':value')] = snapshot.val()[j][k][Object.keys(snapshot.val()[j][k])[0]].value; // j:device, k:the subsystem index, 0:just one subsystem per index
                                    accessedModel['@graph'][i - 1]['geo:lat'] = snapshot.val()[j][k][Object.keys(snapshot.val()[j][k])[0]].locationX;
                                    accessedModel['@graph'][i - 1]['geo:long'] = snapshot.val()[j][k][Object.keys(snapshot.val()[j][k])[0]].locationY;
                                }
                            }
                        }
                    }
                }
            });
            const updatedModelStr = JSON.stringify(accessedModel);
            auxContent.content = updatedModelStr;
            auxContent.user = localStorage.getItem(
                USER_MODEL) ||
                localStorage.getItem('loggedUser'
            );
            auxSavedModels[snapshot.key] = auxContent;
            refSavedModels.update(auxSavedModels); // Update the database
            if (localStorage.getItem(IS_SYNC) !== TRUE) {
                DeviceStore.setModel(accessedModel); // Update the digital twin
            }
        }
    });
});

/* Get all the adapter types and put them in a object, with keys being their names,
 * and the object's values being their ids */
$.ajax({
    type: 'GET',
    url: concatenate(RESTAPIADDRESS, '/api', '/', 'types/'),
    async: true
}).done((allTypes) => {
    const typeAdapters = allTypes._embedded.types;
    let a;
    for (a = 0; a < typeAdapters.length; a++) {
        adapters[typeAdapters[a].name] = typeAdapters[a].id;
    }
});

function verifyAddProp(propertyI) {
    let thisIsAdditionalProperty = true;
    for (let p = 0; p < defaultContentProps.length; p++) {
        if (propertyI.toUpperCase() === defaultContentProps[p].toUpperCase()) {
            thisIsAdditionalProperty = false;
        }
    }
    return thisIsAdditionalProperty;
}

export function concatenate(...theArgs) {
    let concatenatedStr = '';
    let s;
    for (s = 0; s < theArgs.length; s++) {
        try { // It just does not work with empty or undefined strings
            concatenatedStr = concatenatedStr.concat((theArgs[s]).toString());
        } catch (err) {
            console.log('At least of the used arguments is undefined or has not been processed yet, which is generating the following processing error:\n', err);
            concatenatedStr = concatenatedStr.concat('');
            console.log('The error has been handled successfully, though');
            console.log('All the arguments from this call:\n', theArgs);
        }
    }
    return concatenatedStr;
}

/* Function for formatting a MAC Address and letting it available for use in the binding option. 
 * @Parameter: String: MAC Address (not formatted, e.g.: 123456789067)
 * @Return: String: Formatted MAC Address ( e.g.: 12-34-56-78-90-67) */
export function formatMacAddress(macAdd) {
    let FormattedMacAddress;
    let m;
	for (m = 0; m < macAdd.match(/.{1,2}/g).length - 1; m++) {
		FormattedMacAddress = concatenate(FormattedMacAddress, macAdd.match(/.{1,2}/g)[m], '-');
	}
    return concatenate(
        FormattedMacAddress,
        macAdd.match(/.{1,2}/g)[macAdd.match(/.{1,2}/g).length - 1]
    );
}

/* Transforms the object of definitions in a string */
function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

export function fireAjaxExport(type, content) {
    const params = {
        type
    };
    const url = concatenate('/modtool/export', '?', $.param(params));
    let response = '';

    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url,
        data: JSON.stringify(content),
        dataType: 'json',
        async: false
    }).always((msg) => {
        response = msg.responseText;
    });
    return response;
}

export function fireAjaxImport(type, content) {
    const params = {
        type
    };
    let contenttype = '';
    switch (type) {
        case 'rdfxml':
            contenttype = 'application/rdf+xml';
            break;
        case 'turtle':
            contenttype = 'text/turtle';
            break;
        default:
            contenttype = 'application/json';
    }

    const url = concatenate('/modtool/import', '?', $.param(params));

    $.ajax({
        type: 'POST',
        contentType: contenttype,
        url,
        data: content,
        async: false
    }).done((response) => {
        const tempObject = {
            '@context': {},
            '@graph': response
        };
        const context = clone(definitions['@context']);
        const oldResponse = JSON.stringify(response);
        response = response.map((iterDevice) => {
            Object.keys(iterDevice).map((iterAttribute) => {
                if (iterDevice[iterAttribute].length === 1) {
                    iterDevice[iterAttribute] = iterDevice[iterAttribute][0];
                }
                let tempStoreValue = '';
                if (iterDevice[iterAttribute]['@value'] != null) {
                    tempStoreValue = iterDevice[iterAttribute]['@value'].toString();
                    delete iterDevice[iterAttribute];
                    iterDevice[iterAttribute] = tempStoreValue;
                }
            });
            return iterDevice;
        });

        /* Replacing links */
        response.map((iterDevice) => {
            Object.keys(context).map((contextKey) => {
                Object.keys(iterDevice).map((oldKey) => {
                    /* If the entry is a link */
                    if (typeof iterDevice[oldKey] === 'string' && iterDevice[oldKey].includes(context[contextKey])) {
                        const tempString = iterDevice[oldKey].match(/#.+/)[0]; // Getting the match
                        iterDevice[oldKey] = concatenate(contextKey, ':', tempString.slice(1)); // Replacing the entry
                    }

                    if (iterDevice[oldKey]['@list'] && Array.isArray(iterDevice[oldKey]['@list'])) {
                        iterDevice[oldKey] = iterDevice[oldKey]['@list'].map((iterEntry) => (iterEntry['@value']));
                    }

                    if (typeof iterDevice[oldKey] == 'object' && !Array.isArray(iterDevice[oldKey]) && iterDevice[oldKey]['@id'].includes(context[contextKey])) {
                        const tempString = iterDevice[oldKey]['@id'].match(/#.+/)[0]; // Getting the match
                        iterDevice[oldKey]['@id'] = concatenate(contextKey, ':', tempString.slice(1)); // Replacing the entry
                    }

                    /* If the link is included in a oldkey */
                    if (oldKey.includes(context[contextKey])) {
                        const tempString = oldKey.match(/#.+/)[0]; // Getting the match
                        iterDevice[concatenate(contextKey, ':', tempString.slice(1))] = iterDevice[oldKey]; // Replacing the entry
                        delete iterDevice[oldKey];
                    }
                });
            });
        });

        response = {
            '@context': context,
            '@graph': response
        };
        DeviceStore.setModel(response);
    });
}

export function fireAjaxSave(name, content, isBinding, notAlertSave, tmpSaving) {
    localStorage.setItem(IS_SYNC, FALSE); // Do not set a model before the synchronization
    const notShowAlert = notAlertSave | false;
    const thisIsBinding = isBinding | false; // If the user hasn't clicked <Bind>: undefined
    const params = {
        name,
        type: 'json-ld',
    };
    const ref = firebase.database().ref('savedModels/');
    const refDevicesWithSubsystems = firebase.database().ref('devicesWithSubsystems/');
    const url = concatenate('/modtool/saveModel', '?', $.param(params));
    const auxDevSubSecRoot = {}; // For the saved models as secondary roots
    const auxSavedModelsSave = {}; // All the saved models
    const auxNewModel = {}; // Elements: content and user who added the model
    const auxInfoSaved = {};
    const auxContPropsSubsystem = {};

    localStorage.setItem(IS_SYNC, TRUE);
    /* Save the key_model (saved one) as secondary root on Devices With Subsystems */
    auxDevSubSecRoot[params.name] = 'noConnections'; // It'll get all devices with subsystems on this model
    refDevicesWithSubsystems.update(auxDevSubSecRoot); // Update just works out with objects

    if (!tmpSaving) {
        // Get the odd keys to because they have the subsystem information
        for (let i = 1; i < Object.keys(content['@graph']).length; i += 2) {
            // The content->subsystem is connected to a device

            if (content['@graph'][i]['iot-lite:isSubSystemOf']['@id'] !== '') {
                refDevicesWithSubsystems.on('value', (snapshot) => {
                    for (let j = 1; j < Object.keys(content['@graph']).length; j += 2) {
                        if (content['@graph'][i]['iot-lite:isSubSystemOf']['@id'] === content['@graph'][j]['@id']) {
                            var macAddress = content['@graph'][j][concatenate(localStorage.getItem(PREFIX), ':macAddress')];
                            var ipAddress = content['@graph'][j][concatenate(localStorage.getItem(PREFIX), ':ipAddress')];
                        }
                    }
                    const keysModelsDevicesWithSubsystems = Object.keys(snapshot.val());
                    const value = content['@graph'][i][concatenate(localStorage.getItem(PREFIX), ':value')];
                    const typeId = content['@graph'][i]['@type'];

                    /* Get the additional properties on the content->subsytem */
                    let infoContent;
                    for (infoContent in content['@graph'][i]) {
                        if (content['@graph'][i].hasOwnProperty(infoContent)) {
                            if (verifyAddProp(infoContent)) {
                                auxContPropsSubsystem[infoContent] = content['@graph'][i][infoContent];
                            }
                        }
                    }
                    // Depend on the number of subsystems (running on the database)
                    let modelWithDevs;
                    for (modelWithDevs in keysModelsDevicesWithSubsystems) {
                        // The even key on the content has the location object
                        let location = {};
                        location.latitude = content['@graph'][i - 1]['geo:lat'];
                        location.longitude = content['@graph'][i - 1]['geo:long'];

                        /* The device has already a subsystem */
                        if (snapshot.val()[params.name].toString() === content['@graph'][i]['iot-lite:isSubSystemOf']['@id']) {
                            updateDevicesWithSubsystems(
                                params.name,
                                content['@graph'][i]['iot-lite:isSubSystemOf']['@id'],
                                content['@graph'][i]['@id'],
                                location,
                                auxContPropsSubsystem,
                                value,
                                typeId,
                                i,
                                macAddress,
                                ipAddress
                            );
                        } else { // The device does not have a subsystem
                            const auxNewDev = {};
                            auxNewDev[content['@graph'][i]['iot-lite:isSubSystemOf']['@id']] = '';
                            refDevicesWithSubsystems.update(auxNewDev);
                            updateDevicesWithSubsystems(
                                params.name,
                                content['@graph'][i]['iot-lite:isSubSystemOf']['@id'],
                                content['@graph'][i]['@id'],
                                location,
                                auxContPropsSubsystem,
                                value,
                                typeId,
                                i,
                                macAddress,
                                ipAddress
                            );
                        }
                    }
                });
            }
        }

        auxNewModel.user = localStorage.getItem('loggedUser');
        auxNewModel.content = JSON.stringify(content);
        auxSavedModelsSave[params.name] = auxNewModel;
        ref.update(auxSavedModelsSave); // Updating the database
        auxInfoSaved.lastSavedModel = params.name; // Save the id of the last saved model
        refInfoSaved.update(auxInfoSaved); // Update the info of the last saved on the database

        if (!thisIsBinding && !notShowAlert) {
            swal({
                title: 'The model has been saved successfully',
                button: false,
                icon: 'success'
            });
        }
    } else {
        const savedModelStr = JSON.stringify(content);
        auxSavedModelsSave[params.name] = savedModelStr;
        refTmp.update(auxSavedModelsSave); // Update the database
    }
}

export function fireAjaxLoad(name) {
    const params = {
        name // Shorthand object
    };
    $.ajax({
        type: 'GET',
        url: concatenate('/modtool/loadModel', '?', $.param(params)),
        async: false
    }).done((msg) => {
        DeviceStore.setModel(JSON.parse(msg)); //msg is the obj in a string format
    });
}

export function fireAjaxShow() {
    let response = '';
    $.ajax({
        type: 'GET',
        url: '/modtool/showModel',
        async: false
    }).done((msg) => {
        response = msg;
    });
    return response;
}

export function bindComponent(
    idComp,
    componentType,
    idTypeBind,
    idDeviceBind,
    apiAddress,
    pinConfig
) {
    let p;
    let valuesPins = '';
    // -1 because the comma must not be concatenate to the last pin
    for (p = 0; p < pinConfig.length - 1; p++) {
        valuesPins = concatenate(valuesPins, pinConfig[p], ',');
    }
    // Add the last pin to the string of pins without a comma in the end
    valuesPins = concatenate(valuesPins, pinConfig[pinConfig.length - 1]);
    // Pins of the device which the component is attached to
    // (values in the elements prefix:pinConfiguration)
    const pinSet = concatenate('pinset=', valuesPins);
    const deployInfo = concatenate('?component=', componentType.toUpperCase(), '&', pinSet);
    const urlAddress = concatenate(apiAddress, '/api', '/', componentType, 's/');
    const urlAddressDeploy = concatenate(apiAddress, '/api/deploy/', componentType, '/');
    const jsonData = {
        name: idComp,
        type: concatenate(apiAddress, '/api/types/', idTypeBind),
        device: concatenate(apiAddress, '/api/devices/', idDeviceBind),
    };
    $.ajax({
        type: 'POST',
        url: urlAddress,
        contentType: 'application/json',
        accept: 'application/json',
        data: JSON.stringify(jsonData)
    }).done((component) => {
        console.log('The ', componentType, ' has been posted successfully\nId on the MBP Platform: ', component.id);
        $.ajax({
            type: 'POST',
            url: concatenate(urlAddressDeploy, component.id, deployInfo),
            contentType: 'application/json'
        }).done((response) => {
            console.log('The ', componentType, ' has been successfully deployed!\n', response);
        });
    });
}

export function bindDevice(
    idDev,
    macAddressDev,
    ipAddressDev,
    formattedMacAddressDev,
    apiAddress,
    subsystems,
    mapTypeComp,
    callback
) {
    // Get the map between components and types
    const urlAddress = concatenate(apiAddress, '/api', '/', 'devices/');
    const jsonData = {
        name: idDev,
        macAddress: macAddressDev,
        ipAddress: ipAddressDev,
        formattedMacAddress: formattedMacAddressDev
    };
    $.ajax({
        type: 'POST',
        url: urlAddress,
        contentType: 'application/json',
        accept: 'application/json', // In order to get the registered id of the device back from the MBP platform
        data: JSON.stringify(jsonData)
    }).done((device) => {
        console.log('The device has been posted successfully\nId on the MBP Platform: ', device.id);
        let c;
        for (c in subsystems) { // Iterate in all the components in the device
            const prefix = subsystems[c][Object.keys(subsystems[c])[0]]['@type'].split(':')[0];
            const idWithoutPrefix = subsystems[c][Object.keys(subsystems[c])[0]]['@type'].split(':')[1];
            let pinConf;
            // If the element component has pin configuration already set up
            if (concatenate(prefix, ':', PIN_CONF) in subsystems[c][Object.keys(subsystems[c])[0]]) {
                pinConf = subsystems[c][Object.keys(subsystems[c])[0]][concatenate(prefix, ':', PIN_CONF)];
            } else {
                pinConf = {}; // pinset shall be equal to empty for the deployment in case of null pinConfiguration
            }
            bindComponent(
                Object.keys(subsystems[c])[0],
                mapTypeComp[idWithoutPrefix],
                adapters[idWithoutPrefix],
                device.id,
                RESTAPIADDRESS,
                pinConf
            );
        }
        // Bind the next device, if there are more than one device on the digital twin
        return callback();
    });
}

export function syncCurrentModel(isempty) {
    if (window.localStorage) {
        if (!localStorage.getItem('firstLoad')) {
            localStorage.firstLoad = true;
            if (isempty !== false) { // Cases: non-empty save, save as and bind
                localStorage.setItem(LOAD_LAST_MODEL, 'true');
            }
            window.location.reload();
        } else {
            localStorage.removeItem('firstLoad');
        }
    }
}

export function isDigitalTwinEmpty() {
    /* Every model contains an element @context (element with iot-lite information) and 
       @graph (list of elements regarding the devices and components set on the environment) */
    return (DeviceStore.getModel()['@graph'].length === 0);
}
