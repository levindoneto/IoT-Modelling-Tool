import {EventEmitter} from "events";

import dispatcher from "../dispatcher";
import {definitions} from "../constants/definitions";

import {blueprint} from "../constants/blueprint.js"

class DeviceStore extends EventEmitter {
    constructor() {
        super();
        this.model = definitions;
        this.model["@graph"] = [];
        this.definitions = definitions;
        this.blueprint = blueprint;
        this.savedModels = [{id: 1, name: "model1"}, {id: 2, name: "model2"}, {id: 3, name: "model3"}];
    }

    // creates id witch is not used yet
    createId(type) {
        var id = 1;
        if (this.model["@graph"].length > 0) {
            const tempDevice = this.model["@graph"][this.model["@graph"].length - 1];
            const tempLastIndex = tempDevice["@id"].substring(String("ipvs:" + type).length);
            id = parseInt(tempLastIndex) + 1;
        }
        return id;
    }

    // ##### Manipulating the frontend Model ###########################################################################
    // creates new device to model with the properties given contained by the parameter
    createDevice(device) {
        const id = this.createId(device.type);

        const tempDevice = blueprint["@graph"].find(function(object) {
          return object["@id"] === device.type;
        });

        const deviceLocation = blueprint["@graph"].find(function(object) {
          return object["@id"] === tempDevice["geo:location"]["@id"];
        });

        if (tempDevice["geo:location"]["@id"]) {
          tempDevice["geo:location"]["@id"] = tempDevice["geo:location"]["@id"] + id.toString();
        }
        this.model["@graph"].push(tempDevice);    // add the new object to the model

        deviceLocation["@id"] = tempDevice["geo:location"]["@id"]
        deviceLocation["geo:lat"] = device.top;
        deviceLocation["geo:long"] = device.left;

        this.model["@graph"].push(deviceLocation);    // add the new object location to the model

        this.emit("change");
    }

    // Deletes the device with the given id from the model
    deleteDevice(id) {
        var tempDevice = this.model["@graph"].find(function (device) {
            return device["@id"] == id;
        });
        const tempIndex = this.model["@graph"].indexOf(tempDevice);                             // find index of device to delete

        // delete this.model[tempIndex];
        const tempArrayHead = this.model["@graph"].splice(0, tempIndex);                        // get previous devices of device to delete
        const tempArrayTail = this.model["@graph"].splice(1, this.model["@graph"].length - 1);  // get following devices of device to delete
        this.model["@graph"] = tempArrayHead.concat(tempArrayTail);                                       // contract previous and following devices, deleted device is now missing

        this.emit("change");
    }

    // Sets given property to the given value of the device with the given id. If the propertz does not exist, it will be created.
    setProperty(id, property, value) {
        this.model["@graph"][id][property] = value;
        this.emit("change");
    }

    // Returns all properties of the device with the given id
    getPropertiesOfDevice(id) {
        return this.model["@graph"][id];
    }

    // Returns all property ids of the definition that are of one of the types specified in variable types.
    getPossibleProperties() {
        var properties = [];
        const types = ["owl:AnnotationProperty", "owl:DatatypeProperty"];
        for (element of this.model["@graph"]) {
            if (types.includes(element["@type"])) {
                var id = element["@id"];
                var partsOfString = id.split(/:|#/);      // split String at : or #
                var suffix = partsOfString.slice(-1);     // get only the last substring
                properties.push(suffix);
            }
        }
        return properties;
    }

    // Returns all properties listed in the definition of the given device type.
    getPropertiesFromDeviceBlueprint(type){
        for(device of this.blueprint["@graph"]){
            if (type = device["@id"]) {
                return device;
            }
        }

        /*
        $.getJSON("../constants/blueprint.jsonld", function(json) {
            console.log(json); // this will show the info it in firebug console
        });
        */
    }

    // Returns all devices
    getAllDevices() {
        return this.model["@graph"];
    }

    // ##### Save and load whole Models ################################################################################
    // Receive model from server and set it to frontend model
    loadModel(id){
        // this.setModel(/* call Backend API getModel(id) */);
    }

    saveModel(title){
        // call Backend API saveModel(this.model["@graph"], title);
    }


    importModel(data){
        var convertedModel = data;
        if(true /* type not json */){
            // convertedModel = transformModelFrom(data, <format of newModel>);
        }
        this.setModel(JSON.parse(data));

        this.emit("change");
    }

    exportModel(format){
        // return transformModelTo(this.getModel(), format);
    }

    // ----- Helper Methods ---------------------------------------------------
    // Writes given model (by Server or User) to the model
    setModel(newModel){
        this.model = newModel;
    }

    // Returns model for storing or exporting it
    getModel(){
        return this.model;
    }

    getSavedModels() {
      return this.savedModels;
    }

    // ##### Redirecting Method calls ##################################################################################
    // redirects method calls
    handleActions(action) {
        switch (action.type) {
            case "CREATE_DEVICE": {
                this.createDevice(action.device);
                break;
            }
            case "DELETE_DEVICE": {
                this.deleteDevice(action.id);
                break;
            }
            case "SET_PROPERTY": {
                this.setProperty(action.id, action.property, action.value);
                break;
            }
            case "GET_PROPERTIES_OF_DEVICE": {
                this.getPropertiesOfDevice(action.id);
                break;
            }
            /* case "GET_POSSIBLE_PROPERTIES": {
                this.getPossibleProperties();
                break;
            } */
            case "GET_PROPERTIES_FROM_DEVICE_BLUEPRINT": {
                this.getPropertiesFromDeviceBlueprint(action.deviceType);
            }
            case "LOAD_MODEL": {
                this.loadModel(action.id);
                break;
            }
            case "SAVE_MODEL": {
                this.saveModel(action.title);
                break;
            }
            case "IMPORT_MODEL": {
                this.importModel(action.model);
                break;
            }
            case "EXPORT_MODEL": {
                this.exportModel(action.format);
                break;
            }
        }
    }

}

const deviceStore = new DeviceStore;
dispatcher.register(deviceStore.handleActions.bind(deviceStore));

window.dispatcher = dispatcher

export default deviceStore;
