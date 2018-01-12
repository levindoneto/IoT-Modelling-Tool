import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';
import { definitions } from '../constants/definitions';
import * as backend from '../backend/backend';
import * as utils from '../utils/utils';

const PREFIX = localStorage.getItem('prefix');
const RASPBERRY_PI = 'RaspberryPi'; // Device with GPIO Mode

function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

class DeviceStore extends EventEmitter {
    constructor() {
        super();
        this.model = clone(definitions);
        this.model['@graph'] = [];
        this.definitions = definitions;
        this.selectedDevice = '';
        this.deviceTypes = [];
        this.isSetPropertyOpen = false;
    }

    /* Creates an id which hasn't been used yet */
    createId(type) {
        let id = 1;

        if (this.model['@graph'].length > 0) {
            const devicesFamily = this.model['@graph'].filter((device) => device['@id'].match(new RegExp(`${type}-` + '\\d+')) != null);

            if (devicesFamily.length > 0) {
                const tempEntry = devicesFamily.slice(-1);
                const tempString = tempEntry[0]['@id'];
                const tempCount = tempString.match(new RegExp('-' + '\\d+'))[0].slice(1);
                id = parseInt(tempCount) + 1;
            }
        }
        return id;
    }

    /* Manipulate the frontend Model.
     * Create a new device into the model with the properties given contained by the parameter */
    createDevice(device) {
        const id = this.createId(device.type);
        /* Create device, id and type */
        const createdDevice = {};
        createdDevice['@id'] = `${device.type}-${id.toString()}`;
        createdDevice['@type'] = device.type;

        /* Create location and then referencing it in a device/component */
        const createdLocation = {};
        createdLocation['@id'] = `${createdDevice['@id']}-Location`;
        createdLocation['@type'] = 'geo:Point';
        createdLocation['geo:lat'] = device.top.toString();
        createdLocation['geo:long'] = device.left.toString();
        createdDevice['geo:location'] = {};
        createdDevice['geo:location']['@id'] = createdLocation['@id'];
        this.model['@graph'].push(createdLocation);

        /* Device is an smart device, with mac-address and possibly pins */
        /* Device might have the numberOfPins property */
        const parentClasses = utils.getParentClasses(device.type);
        const restrictions = utils.getRestrictions();
        const restrictionNames = restrictions.map((iterRestriction) => (iterRestriction['@id']));

        /* It shall be an array of one element always */
        const restrictionId = utils.intersection(restrictionNames, parentClasses)[0];
        if (!parentClasses.includes('iot-lite:ActuatingDevice') && !parentClasses.includes('ssn:SensingDevice')) {
            createdDevice[backend.concatenate(PREFIX, ':macAddress')] = '';
            if (restrictionId.length > 0) {
                const restriction = restrictions.find((findRestriction) => (findRestriction['@id'] === restrictionId));
                if (restriction != null) {
                    createdDevice[backend.concatenate(PREFIX, ':numberOfPins')] = parseInt(restriction['owl:cardinality']['@value']); 
                }
            }
        } else {
            /* Device is a "primitive" (i.e. has no mac address) - a sensor or an actuator
             * Sensors and Actuators might have the pinConfiguration property */
            if (parentClasses['1'] === 'ssn:SensingDevice') { // Just sensors have values
                createdDevice[backend.concatenate(PREFIX, ':value')] = ' ';
            }
            createdDevice[backend.concatenate(PREFIX, ':pinConfiguration')] = [];
            if (restrictionId.length > 0) {
                const restriction = restrictions.find((findRestriction) => (findRestriction['@id'] === restrictionId));
                if (restriction != null) {
                    const index = parseInt(restriction['owl:cardinality']['@value']);
                    // Set pins with an identical number, so list's problems aren't obtained
                    for (let i = 1; i <= index; i++) {
                        createdDevice[backend.concatenate(PREFIX, ':pinConfiguration')].push(i);
                    }
                }
            }
        }

        if (device.type === backend.concatenate(PREFIX, ':', RASPBERRY_PI)) {
            createdDevice[backend.concatenate(PREFIX, ':gpioMode')] = ''; 
        }
        createdDevice['iot-lite:isSubSystemOf'] = {
            '@id': ''
        };

        /* Push a device into the model */
        this.model['@graph'].push(createdDevice);
        this.emit('change');

        return createdDevice['@id'];
    }

    /* Delete the device with the given id from the model */
    deleteDevice(id, isRecursion) {
        const tempDevice = this.model['@graph'].find((device) => device['@id'] === id);

        const tempProperties = Object.keys(tempDevice).filter((iterKey) => tempDevice[iterKey]['@id'] && !['iot-lite:isSubSystemOf', 'ssn:hasQuantityKind', 'ssn:hasUnit'].includes(iterKey));

        /* Delete objects that are referenced by the device, except for supersystems, 
         * quantitykinds and units */
        if (tempProperties.length > 0) {
            tempProperties.map((iterKey) => {
                this.deleteDevice(tempDevice[iterKey]['@id'], true);
            });
        }

        // Delete a device
        this.model['@graph'] = this.model['@graph'].filter((device) => (device['@id'] !== id));

        // Neutralize occurences of a device
        this.model['@graph'] = this.model['@graph'].map((device) => {
            Object.keys(device).map((attribute) => {
                if (device[attribute]['@id'] && device[attribute]['@id'] == id) {
                    device[attribute]['@id'] = '';
                }
            });
            return device;
        });

        if (!isRecursion) {
            this.emit('change');
        }
    }

    /* Set a given property into the given device's value with a given id. 
     * If the property doesn't exist, it will be created. */
    setProperty(id, property, value, key) {
        /* Device, whose property is being set */
        const tempDevice = this.model['@graph'].find((object) => object['@id'] === id);

        /* Property object on definitions */
        const tempProperty = this.definitions['@graph'].find((object) => object['@id'].includes(property));

        if (value == null) {
            delete tempDevice[property];
        } else {
            /* Is it the property non-primitive? */
            if (tempProperty != null) {
                if (Array.isArray(tempDevice[tempProperty['@id']])) {
                    tempDevice[tempProperty['@id']][key] = value.toString();
                } else if (!tempProperty['rdfs:range'] || tempProperty['rdfs:range']['@id'].startsWith('xsd')) {
                    tempDevice[tempProperty['@id']] = value.toString();
                } else {
                    tempDevice[tempProperty['@id']] = {
                        '@id': value
                    };
                }
            } else {
                const oldValue = tempDevice[property[0]];
                tempDevice[property[0]] = value;

                /* Change references of the old value to the new one */
                this.model['@graph'].map((iterObject) => {
                    Object.keys(iterObject).map((iterKey) => {
                        if (iterObject[iterKey]['@id'] === oldValue) {
                            iterObject[iterKey]['@id'] = value;
                        } else if (iterObject[iterKey]['@id'] && iterObject[iterKey]['@id'].includes(oldValue)) {
                            iterObject[iterKey]['@id'] = iterObject[iterKey]['@id'].replace(oldValue, value);
                        }
                    });

                    if (iterObject['@id'].includes(oldValue)) {
                        iterObject['@id'] = iterObject['@id'].replace(oldValue, value);
                    }
                });
            }
        }
        this.emit('change');
    }

    /* Delete the given property from the device with the given id */
    deleteProperty(id, property) {
        delete this.model['@graph'][id][property];
    }

    /* Returns all properties of the device with the given id */
    getPropertiesOfDevice(id) {
        return this.model['@graph'][id];
    }

    /* Return all property's ids of the definition that are one of the 
     * types specified in variable types. */
    getPossibleProperties(type) {
        // Just 'owl:Restriction' relies on values
        const types = ['owl:AnnotationProperty', 'owl:DatatypeProperty', 'owl:ObjectProperty', 'owl:Restriction'];
        const tempType = this.definitions['@graph'].find((iterType) => iterType['@id'] === type);
        let tempResponse = [];
        let recursiveResponse = [];

        if (tempType['rdfs:subClassOf']) {
            if (tempType['rdfs:subClassOf'].length) {
                tempType['rdfs:subClassOf'].map((subclass) => {
                    
                    recursiveResponse = backend.concatenate(recursiveResponse, this.getPossibleProperties(subclass['@id']));
                });
            } else {
                recursiveResponse = this.getPossibleProperties(tempType['rdfs:subClassOf']['@id']);
            }
        }

        let tempAsdf = this.definitions['@graph'].filter((property) => {
            if (types.includes(property['@type']) && (property['@id'].includes('iot-lite') || property['@id'].includes(type.split(/:/)[0]))) {
                if (property['rdfs:domain']) {
                    return property['rdfs:domain']['@id'] === type;
                } else if (property['rdfs:range']) {
                    return property['rdfs:range']['@id'] === type;
                }

                return true;
            }
        });
        tempAsdf = tempAsdf.map((item) => item['@id'].split(/:|#/).slice(-1)[0]);
        tempResponse = backend.concatenate(recursiveResponse, tempAsdf);

        return tempResponse;
    }

    /* Return all devices/components */
    getAllDevices() {
        return this.model['@graph'];
    }

    /* Save and load Models */
    /* Receive the model from the server and set it to frontend model */
    loadModel(name) { 
        backend.fireAjaxLoad(name);
    }

    SaveModelAs(title) {
        this.emit('change');
    }

    importModel(data) {
        const convertedModel = data;
        this.setModel(convertedModel);
    }

    exportModel(format) {
        backend.fireAjaxExport(format, this.getModel());
    }

    /* Help Methods */
    /* Write the given model (by Server or User) into the model */
    setModel(newModel) { 
        this.model = newModel;
        this.emit('change');
    }

    /* Return the model for storing or exporting it */
    getModel() {
        return this.model;
    }

    getSavedModels() {
        return this.savedModels;
    }

    setSelectedDevice(id) {
        this.selectedDevice = id;
        this.emit('change');
    }

    getSelectedDevice() {
        return this.selectedDevice;
    }

    addDeviceType(type) {
        this.deviceTypes.push(type);
    }

    getDeviceTypes() {
        return this.deviceTypes;
    }

    clearDevices() {
        this.model['@graph'] = [];
        this.emit('change');
    }

    openSetProperty() {
        this.isSetPropertyOpen = true;
        this.emit('change');
    }

    closeSetProperty() {
        this.isSetPropertyOpen = false;
        this.emit('change');
    }

    /* Redirect Method calls */
    handleActions(action) {
        switch (action.type) {
            case 'CREATE_DEVICE':
                this.createDevice(action.device);
                break;
            case 'DELETE_DEVICE':
                this.deleteDevice(action.id);
                break;
            case 'SET_PROPERTY':
                this.setProperty(action.id, action.property, action.value, action.key);
                break;
            case 'DELETE_PROTERTY':
                this.deleteProperty(action.id, action.property);
                break;
            case 'GET_PROPERTIES_OF_DEVICE': 
                this.getPropertiesOfDevice(action.id);
                break;
            case 'LOAD_MODEL': 
                this.loadModel(action.id);
                break;
            case 'SAVE_MODEL_AS': 
                this.SaveModelAs(action.title);
                break;
            case 'IMPORT_MODEL': 
                this.importModel(action.model);
                break;
            case 'EXPORT_MODEL': 
                this.exportModel(action.format);
                break;
            case 'SELECT_DEVICE': 
                this.setSelectedDevice(action.id);
                break;
            case 'ADD_DEVICE_TYPE': 
                this.addDeviceType(action.id);
                break;
            case 'CLEAR_DEVICES': 
                this.clearDevices();
                break;
            case 'OPEN_SET_PROPERTY': 
                this.openSetProperty();
                break;
            case 'CLOSE_SET_PROPERTY': 
                this.closeSetProperty();
                break;
            default:
                this.SaveModelAs(action.title);
        }
    }
}

const deviceStore = new DeviceStore();
dispatcher.register(deviceStore.handleActions.bind(deviceStore));

export default deviceStore;
