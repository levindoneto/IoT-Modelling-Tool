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
            try {
                parentClasses = parentClasses.concat(getParentClasses(tempObject['rdfs:subClassOf']['@id']));
            }
            catch (err) {
                console.log('At least of the used arguments is undefined or has not been processed yet, which is generating the following processing error:\n', err);
            }
        }
        else {
            tempObject['rdfs:subClassOf'].map((iterObject) => {
                try {
                    parentClasses = parentClasses.concat(getParentClasses(iterObject['@id']));
                }
                catch (err) {
                    console.log('At least of the used arguments is undefined or has not been processed yet, which is generating the following processing error:\n', err);
                }
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
    //console.log('property in utils: ', property);
    if (property == null || property === '@id' || property === '' || property === 'ipvs:value') {
        return true;
    }

    const tempObject = getObjectFromGraphById(property, definitions['@graph']);
    if (typeof tempObject === 'undefined') {
        console.log("Unchangeable properties can't be modified");
    }
    return tempObject['@type'] !== 'owl:ObjectProperty';
}