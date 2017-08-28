import * as DropActions from '../actions/DropActions';
import { definitions } from '../constants/definitions';

const clone = (object) => {
    return JSON.parse(JSON.stringify(object));
};

export function getObjectFromGraphById(id, graph) {
    const temp = graph.find((iterObject) => {
        return iterObject['@id'] === id;
    });

    if (temp != null) {
        return clone(temp);
    }
}

export function getParentClasses(type) {
    let parentClasses = [];
    const tempObject = getObjectFromGraphById(type, definitions['@graph']);

    parentClasses = [tempObject['@id']];

    if (tempObject['rdfs:subClassOf'] != null) {
        if (tempObject['rdfs:subClassOf'].length == null) {
            parentClasses = parentClasses.concat(getParentClasses(tempObject['rdfs:subClassOf']['@id']));
        }
        else {
            tempObject['rdfs:subClassOf'].map((iterObject) => {
                parentClasses = parentClasses.concat(getParentClasses(iterObject['@id']));
            });
        }
    }
    return parentClasses;
}

export function getRestrictions() {
    return definitions['@graph'].filter((filterObject) => {
        return filterObject['@type'] === 'owl:Restriction';
    });
}

export function includesTypesInParentClasses(types, parentClasses) {
    if (typeof types === 'object' && types.length > 0) {
        types = types.filter((iterType) => parentClasses.includes(iterType));
        return types.length > 0;
    }
    else {
        return parentClasses.includes(types);
    }
}

export function intersection(array1, array2) {
    return array1.filter((filterObject) => {
        return array2.find((findObject) => (Object.is(findObject, filterObject)));
    });
}

export function cleanOutAttributes(unwantedAttributes, object) {
    Object.keys(object).map((iterKey) => {
        if (unwantedAttributes.includes(iterKey)) {
            delete object[iterKey];
        }
        /* Tue attribute is an array of objects */
        if (Array.isArray(object[iterKey])) {
            object[iterKey].map((iterObject) => {
                cleanOutAttributes(unwantedAttributes, iterObject);
            });
        }
        else if (typeof object[iterKey] === 'object') {
            cleanOutAttributes(unwantedAttributes, object[iterKey]);
        }
    });
}

export function isPrimitiveProperty(property) {
    if (property == null || property === '@id' || property === '') {
        return true; 
    }

    const tempObject = getObjectFromGraphById(property, definitions['@graph']);
    if(typeof tempObject === 'undefined') {
        //console.log("Unchageable properties can't be edited");
        return false;
    }
    else {
        console.log ('Property: ', property);
        console.log('tempObject: ', tempObject); //undefined
        return tempObject['@type'] !== 'owl:ObjectProperty';
    }
}
