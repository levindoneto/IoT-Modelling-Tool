import DeviceStore from '../stores/DeviceStore';
import {definitions} from '../constants/definitions';
import fire from '../database/fire';
import reactfire from 'reactfire';

/* Transforms the object of definitions in a string */
function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

export function fire_ajax_export(type, content) {
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


export function fire_ajax_import(type, content) {
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

export function fire_ajax_save(name, content) {
    const params = {
        name,
        type: 'json-ld',
    };
    const ref = firebase.database().ref('savedModels/');
    const refInfoSaved = firebase.database().ref('infoSavedModels');
    
    ref[params.name] = savedModelStr;
    const auxSavedModels = {};
    const auxInfoSaved = {};
    const url = '/modtool/saveModel' + '?' + $.param(params);
    //console.log('Id to save on the database:', params.name); //SAVE IN THE DATABASE
    
    const refDevicesWithSubsystems = firebase.database().ref('devicesWithSubsystems/');
    refDevicesWithSubsystems.on("value", (snapshot) => {
        const keysDevicesWithSubsystems = Object.keys(snapshot.val());
        for (let devSub in keysDevicesWithSubsystems) {
            console.log('KEY ', devSub, ': ', keysDevicesWithSubsystems[devSub]);
            if (keysDevicesWithSubsystems[devSub].toString() === 'ipvs:RaspberryPi-1') {
                console.log('The device has already a subsystem');
            }
        }  
    });
\
    console.log('Keys of content.graph: ', content['@graph']); //SAVE IN THE DATABASE
    //console.log('TYPE of the content: ', typeof content); // object
    let savedModelStr = JSON.stringify(content);
    //console.log('New content', savedModelStr);
    //console.log('Type of the new content', typeof savedModelStr);
    auxSavedModels[params.name] = savedModelStr;
    ref.update(auxSavedModels); // Updating the database
    auxInfoSaved.lastSavedModel = params.name; // Save the id of the last saved model
    refInfoSaved.update(auxInfoSaved); // Update the info of the last saved on the database
    swal({
        title: 'The model has been saved',
        timer: 1500,
        showConfirmButton: false
    });
    let message = false;
}

export function fire_ajax_load(name) {
    const params = {
        name: name
    };
    $.ajax({
        type: "GET",
        url: "/modtool/loadModel" + "?" + $.param(params),
        async: false
    }).done((msg) => {
        DeviceStore.setModel(JSON.parse(msg)); //msg is the obj in a string format
    });
}


export function fire_ajax_show() {
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
