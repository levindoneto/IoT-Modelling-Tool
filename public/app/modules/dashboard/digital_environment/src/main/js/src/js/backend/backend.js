import DeviceStore from '../stores/DeviceStore';
import {definitions} from '../constants/definitions';

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
    }).always(function(msg) {
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
        }).done(function(response) {
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
    const url = '/modtool/saveModel' + '?' + $.param(params);
    let message = false;
    $.ajax({
        type: 'POST',
        contentType : 'application/json',
        url,
        async: false,
        data: JSON.stringify(content),
        dataType: 'json'
    }).done(function(){
        message = true;
    }).fail(function(){
        message = false;
    });
    return message;
}

export function fire_ajax_load(name) {
    const params = {
        name
    };
    $.ajax({
        type: 'GET',
        url: '/modtool/loadModel' + '?' + $.param(params),
        async: false
    }).done(function (msg) {
        DeviceStore.setModel(JSON.parse(msg));
    });
}

export function fire_ajax_show() {
    let response = '';
    $.ajax({
        type: 'GET',
        url: '/modtool/showModel',
        async: false
    }).done(function (msg){
        response = msg;
    });
    return response;
}
