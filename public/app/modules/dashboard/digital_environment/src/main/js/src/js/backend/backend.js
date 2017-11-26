import DeviceStore from '../stores/DeviceStore';
import { definitions } from '../constants/definitions';
import fire from '../database/fire';
import reactfire from 'reactfire';

/* Times' levels for hierarchical execution (ms) */
const LEVEL = {
    ONE: 1000,
    TWO: 1500,
    THERE: 3000
};
//console.log('Triggering ...');
const auxSavedModels = {};
let accessedModel = {};
const refTrig = firebase.database().ref('devicesWithSubsystems/');
const refSavedModels = firebase.database().ref('savedModels/');
refTrig.on('child_changed', (snapshot) => {
    //console.log('Something has changed on the saved model: ', snapshot.key); // key() for older firebase versions 
    //console.log('The changed element: ', snapshot.val());
    refSavedModels.on('value', (savedM) => {
        accessedModel = JSON.parse(savedM.val()[snapshot.key]);
        for (let i = 0; i < (Object.keys(accessedModel[['@graph']])).length; i++) {
            //console.log('i: ', i);
            for (let j in snapshot.val()) {
                //console.log('snapshot val: ', snapshot.val()[j]);
                //console.log('j: ', j);
                for (let k in snapshot.val()[j]) {
                    if (i.toString() === k.toString()) {
                        accessedModel['@graph'][i]['ipvs:value'] = snapshot.val()[j][k][Object.keys(snapshot.val()[j][k])[0]].value; // j:device, k:the subsystem index, 0:just one subsystem per index
                    }
                }
            }
        }
    });
    const updatedModelStr = JSON.stringify(accessedModel);
    auxSavedModels[snapshot.key] = updatedModelStr;
    refSavedModels.update(auxSavedModels); // Update the database
    DeviceStore.setModel(accessedModel); // Update the digital twin
});

const defaultContentProps = [ // properties that won't be parsed
    'geo:location',
    '@id',
    'iot-lite:isSubSystemOf',
    'ipvs:value',
    '@type'];

function verifyAddProp(propertyI) {
    let thisIsAdditionalProperty = true;
    for (let p = 0; p < defaultContentProps.length; p++) {
        if (propertyI.toUpperCase() === defaultContentProps[p].toUpperCase()) { // the property is a default one
            thisIsAdditionalProperty = false; // This means property_i is in the list of default properties
        }           
    }
    return thisIsAdditionalProperty;
}

/* Transforms the object of definitions in a string */
function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

export function fireAjaxExport(type, content) {
    const params = {
        type
    };
    const url = '/modtool/export' + '?' + $.param(params);
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
		
        const url = '/modtool/import' + '?' + $.param(params);

        $.ajax({
            type: 'POST',
            contentType: contenttype,
            url,
            data: content,
            async: false
        }).done((response) => {
            const tempObject = {'@context': {}, '@graph': response};
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
                        iterDevice[oldKey] = contextKey + ':' + tempString.slice(1); // Replacing the entry
                    }

                    if (iterDevice[oldKey]['@list'] && Array.isArray(iterDevice[oldKey]['@list'])) {
                        iterDevice[oldKey] = iterDevice[oldKey]['@list'].map((iterEntry) => (iterEntry['@value']));
                    }

                    if (typeof iterDevice[oldKey] == 'object' && !Array.isArray(iterDevice[oldKey])  && iterDevice[oldKey]['@id'].includes(context[contextKey])) { 
                        const tempString = iterDevice[oldKey]['@id'].match(/#.+/)[0]; // Getting the match
                        iterDevice[oldKey]['@id'] = contextKey + ':' + tempString.slice(1); // Replacing the entry
                    }

                    /* If the link is included in a oldkey */
                    if (oldKey.includes(context[contextKey])) {
                        const tempString = oldKey.match(/#.+/)[0]; // Getting the match
                        iterDevice[contextKey + ':' + tempString.slice(1)] = iterDevice[oldKey]; // Replacing the entry
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

export function fireAjaxSave(name, content, isBinding) {
    const thisIsBinding = isBinding | false; // If the user hasn't clicked <Bind> isBinding is undefined
    const params = {
        name,
        type: 'json-ld',
    };
    const ref = firebase.database().ref('savedModels/');
    const refInfoSaved = firebase.database().ref('infoSavedModels');
    const refDevicesWithSubsystems = firebase.database().ref('devicesWithSubsystems/');
    const auxDevSubSecRoot = {}; // For the saved models as secondary roots
    const auxSavedModels = {};
    const auxInfoSaved = {};
    const auxContPropsSubsystem = {};
    const url = '/modtool/saveModel' + '?' + $.param(params);
    ref[params.name] = savedModelStr;
    
    /* Save the key_model (saved one) as secondary root on Devices With Subsystems */
    auxDevSubSecRoot[params.name] = 'noConnections'; // It'll get all devices with subsystems on this model
    refDevicesWithSubsystems.update(auxDevSubSecRoot); // Update just works out with objects
    
    for (let i = 1; i < Object.keys(content['@graph']).length; i += 2) { // Get the odd keys to because they have the subsystem information
        //console.log('THE SUBSYSTEM: ', content['@graph'][i]['iot-lite:isSubSystemOf']['@id']);
        //console.log('i=', i, 'for the device: ', content['@graph'][i]['@id']);
        if (content['@graph'][i]['iot-lite:isSubSystemOf']['@id'] !== '') { // The content->subsystem is connected to a device
            refDevicesWithSubsystems.on('value', (snapshot) => {
                const keysModelsDevicesWithSubsystems = Object.keys(snapshot.val());
                const value = content['@graph'][i]['ipvs:value'];
                const typeId = content['@graph'][i]['@type'];
                /* Get the additional properties on the content->subsytem */
                for (var infoContent in content['@graph'][i]) {
                    if (content['@graph'][i].hasOwnProperty(infoContent)) {
                        if (verifyAddProp(infoContent)) {
                            auxContPropsSubsystem[infoContent] = content['@graph'][i][infoContent];
                        }
                    }
                }

                for (let modelWithDevs in keysModelsDevicesWithSubsystems) { // Depends on the number of subsystems (running on the database)
                    const locationX = content['@graph'][i - 1]['geo:lat']; // The even key on the content has the location object
                    const locationY = content['@graph'][i - 1]['geo:long'];
                    
                    if (snapshot.val()[params.name].toString() === content['@graph'][i]['iot-lite:isSubSystemOf']['@id']) {
                        //console.log('The device has already a subsystem');
                        updateDevicesWithSubsystems(params.name, content['@graph'][i]['iot-lite:isSubSystemOf']['@id'], content['@graph'][i]['@id'], locationX, locationY, auxContPropsSubsystem, value, typeId, i); //(model_key, device, subsystem): device.update(component)
                    }
                    else {
                        //console.log('The device has not a subsystem');
                        const auxNewDev = {};
                        auxNewDev[content['@graph'][i]['iot-lite:isSubSystemOf']['@id']] = '';
                        refDevicesWithSubsystems.update(auxNewDev);
                        updateDevicesWithSubsystems(params.name, content['@graph'][i]['iot-lite:isSubSystemOf']['@id'], content['@graph'][i]['@id'], locationX, locationY, auxContPropsSubsystem, value, typeId, i); //(model_key, device, subsystem): device.update(component)
                    }
                }  
            });
        }
    }
    
    let savedModelStr = JSON.stringify(content);
    auxSavedModels[params.name] = savedModelStr;
    ref.update(auxSavedModels); // Updating the database
    auxInfoSaved.lastSavedModel = params.name; // Save the id of the last saved model
    refInfoSaved.update(auxInfoSaved); // Update the info of the last saved on the database

    if (!thisIsBinding) {
        swal({
            title: 'The model has been saved successfully',
            timer: LEVEL.TWO,
            showConfirmButton: false
        });
    }
}

export function fireAjaxLoad(name) {
    const params = {
        name // Shorthand object
    };
    $.ajax({
        type: 'GET',
        url: '/modtool/loadModel' + '?' + $.param(params),
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

    //console.log('Response: ', response);
    return response;
}

export function bindComponent(idComp, componentType, idTypeBind, idDeviceBind, apiAddress) {
    const urlAddress = (((apiAddress.concat('/api')).concat('/')).concat(componentType)).concat('/');
    console.log('urlAddress: ', urlAddress);
    const jsonData = {
        name: idComp,
        type: (apiAddress.concat('/api/types/')).concat(idTypeBind),
        device: (apiAddress.concat('/api/devices/')).concat(idDeviceBind),
      };
    $.ajax({
        type: 'POST',
        url: urlAddress,
        contentType: 'application/json',
        accept: 'application/json', // In order to get the registered of the component back from the MBP platform
        data: JSON.stringify(jsonData)
    }).done((component) => {
       console.log('The component has been posted successfully\n', component.id);
    });
}

export function bindDevice(idDev, macAddressDev, ipAddressDev, formattedMacAddressDev, apiAddress, subsystems, countTest) {
    const urlAddress = ((apiAddress.concat('/api')).concat('/')).concat('devices/');
    //console.log('subsystems: ', subsystems);
    console.log('countTest: ', countTest);
    var idRegDev;
    var c; // Iterate in all the components in the device
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
        idRegDev = device.id;
        console.log('The device has been posted successfully\nId of the device: ', device.id);
        /* ToDo
        for (j in snapdev.val()[snapshot.val().lastLoadedModel][i]) {
            idSplit = (snapdev.val()[snapshot.val().lastLoadedModel][i][j][Object.keys(snapdev.val()[snapshot.val().lastLoadedModel][i][j])[0]]['@type']).split(':'); // Get the id of the component without the prefix (0: prefix, 1:id)                    
            backend.bindComponent(Object.keys(snapdev.val()[snapshot.val().lastLoadedModel][i][j])[0], mapTypeComp[idSplit[1]], '5a0f2a8b4f0c7363179e58e5','5a0f17a64f0c7363179e58da', 'http://192.168.209.176:8080/MBP'); // Post component into the MBD platform
            console.log('Register the componenent <', snapdev.val()[snapshot.val().lastLoadedModel][i][j][Object.keys(snapdev.val()[snapshot.val().lastLoadedModel][i][j])[0]]['@type'], '> as subsystem of the device <', i, '>'); //POST /api/types/ HTTP/1.1
       }
        */

        //bindAllComponents...
    });

    // Get id from the device in order to return it
    setTimeout(() => {
        console.log('OUTSIDE ID: ', idRegDev);
       
    }, 1500);

    return idRegDev; //ToDo: Change it
    
}
