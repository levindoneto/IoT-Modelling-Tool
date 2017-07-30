import {EventEmitter} from "events";
import dispatcher from "../dispatcher";
import {definitions} from "../constants/definitions";

import * as backend from "../backend/backend";
import * as utils from '../utils/utils';


function clone(object) {
  return JSON.parse(JSON.stringify(object));
}

class DeviceStore extends EventEmitter {
    constructor() {
        super();
        this.model = clone(definitions);
        this.model["@graph"] = [];
        this.definitions = definitions;

        this.selectedDevice = "";
        this.deviceTypes = [];
        this.isSetPropertyOpen = false;
    }

    // creates id witch is not used yet
    createId(type) {
        let id = 1;

        if (this.model["@graph"].length > 0) {
            const devicesFamily = this.model["@graph"].filter(function(device) {
              return device["@id"].match(new RegExp(type + '-' + '\\d+')) != null;
            });

            if (devicesFamily.length > 0) {
              const tempEntry = devicesFamily.slice(-1);
              const tempString = tempEntry[0]["@id"];

              const tempCount = tempString.match(new RegExp('-' + '\\d+'))[0].slice(1);

              id = parseInt(tempCount) + 1;
            }
        }
        return id;
    }

    // ##### Manipulating the frontend Model ###########################################################################
    // creates new device to model with the properties given contained by the parameter
    createDevice(device) {
        const id = this.createId(device.type);

        // create device, id and type
        const createdDevice = {};
        createdDevice["@id"] = device.type + "-" + id.toString();
        createdDevice["@type"] = device.type;

        // creating location and then referencing it in device
        const createdLocation = {};
        createdLocation["@id"] = createdDevice["@id"] + "-Location";
        createdLocation["@type"] = "geo:Point";
        createdLocation["geo:lat"] = device.top.toString();
        createdLocation["geo:long"] = device.left.toString();

        createdDevice["geo:location"] = {};
        createdDevice["geo:location"]["@id"] = createdLocation["@id"];
        this.model["@graph"].push(createdLocation);

        // device is a smart device, with mac-address and possibly pins
        const parentClasses = utils.getParentClasses(device.type);
        const restrictions = utils.getRestrictions();
        const restrictionNames = restrictions.map((iterRestriction) => (iterRestriction["@id"]));

        // should be array of one element always
        const restrictionId = utils.intersection(restrictionNames, parentClasses)[0];

        if ( !parentClasses.includes("iot-lite:ActuatingDevice") && !parentClasses.includes("ssn:SensingDevice") ) {
          createdDevice["ipvs:macAddress"] = "";

          if ( restrictionId.length > 0 ) {
            const restriction = restrictions.find((findRestriction) => (findRestriction["@id"] === restrictionId));

            if ( restriction != null )
              createdDevice["ipvs:numberOfPins"] = parseInt(restriction["owl:cardinality"]["@value"]);
          }
        }
        // device is a "primitive" (i.e. has no mac address) - a sensor or an actuator
        else {

          createdDevice["ipvs:pinConfiguration"] = [];

          if ( restrictionId.length > 0 ) {
            const restriction = restrictions.find((findRestriction) => (findRestriction["@id"] === restrictionId));

            if ( restriction != null ) {
              const index  = parseInt(restriction["owl:cardinality"]["@value"]);

              // set pins to their identical number so we don't get troubes in the List
              for (let i = 1; i <= index; i++) {
                createdDevice["ipvs:pinConfiguration"].push(i);
              }
            }
          }

        }

        if (device.type === "ipvs:RaspberryPi")
          createdDevice["ipvs:gpioMode"] = "";


        createdDevice["iot-lite:isSubSystemOf"] = {
          "@id": ""
        };


        // push device into model
        this.model["@graph"].push(createdDevice);


        this.emit("change");

        return createdDevice["@id"];
    }

    // Deletes the device with the given id from the model
    deleteDevice(id, isRecursion) {

        let tempDevice = this.model["@graph"].find(function (device) {
            // return device["@id"] == tempId;
            return device["@id"] == id;
        });

        const tempProperties = Object.keys(tempDevice).filter((iterKey) => {
          return tempDevice[iterKey]["@id"] && !["iot-lite:isSubSystemOf", "ssn:hasQuantityKind", "ssn:hasUnit"].includes(iterKey);
        });

        // delete objects that are referenced by this device, except for supersystems, quantitykinds and units
        if (tempProperties.length > 0) {
            // delete referencedObjects
            tempProperties.map((iterKey) => {
              this.deleteDevice(tempDevice[iterKey]["@id"], true)
            })
        }

        // delete device
        this.model["@graph"] = this.model["@graph"].filter((device) => {
          return (device["@id"] != id) ;
        });


        // neutralize occurences of device
        this.model["@graph"] = this.model["@graph"].map((device) => {
          Object.keys(device).map((attribute) => {
            if (device[attribute]["@id"] && device[attribute]["@id"]  == id) {
      				device[attribute]["@id"] = "";
            }
          });
    		  return device;
        });

        if (!isRecursion)
          this.emit("change");
      // }
    }



    // Sets given property to the given value of the device with the given id. If the propertz does not exist, it will be created.
    setProperty(id, property, value, key) {


        // Device, whose property we are setting
        let tempDevice = this.model["@graph"].find(function(object) {
          return object["@id"] === id;
        });


        // property object in definitions
        const tempProperty = this.definitions["@graph"].find(function(object) {
          return object["@id"].includes(property);
        });


        if (value == null)
          delete tempDevice[property];
        else {

          // is the property not primitive?
          if (tempProperty != null) {

            if (Array.isArray(tempDevice[tempProperty["@id"]])) {
              tempDevice[tempProperty["@id"]][key] = value.toString();
            }
            else if (!tempProperty["rdfs:range"] || tempProperty["rdfs:range"]["@id"].startsWith("xsd")) {
              tempDevice[tempProperty["@id"]] = value.toString();
            }
            else {
              tempDevice[tempProperty["@id"]] = {
                "@id": value
              };
            }
          }
          else {
            const oldValue = tempDevice[property[0]];
            tempDevice[property[0]] = value;

            // change references of the old value to the new
            this.model["@graph"].map((iterObject) => {
              Object.keys(iterObject).map((iterKey) => {
                if (iterObject[iterKey]["@id"] === oldValue) {
                  iterObject[iterKey]["@id"] = value;
                }
                else if (iterObject[iterKey]["@id"] && iterObject[iterKey]["@id"].includes(oldValue))
                  iterObject[iterKey]["@id"] = iterObject[iterKey]["@id"].replace(oldValue, value);
              });

              if (iterObject["@id"].includes(oldValue))
                iterObject["@id"] = iterObject["@id"].replace(oldValue, value);

            });
          }
        }


        this.emit("change");
    }

    // Deletes the given property from the device with the given id
    deleteProperty(id, property) {
            // ToDo: Ggf referenziertes Objekt loeschen
        delete this.model["@graph"][id][property];  //Loeschen des Attributs
    }

    // Returns all properties of the device with the given id
    getPropertiesOfDevice(id) {
        return this.model["@graph"][id];
    }

    // Returns all property ids of the definition that are of one of the types specified in variable types.
    getPossibleProperties(type) {
      const types = ["owl:AnnotationProperty", "owl:DatatypeProperty", "owl:ObjectProperty"];
      // do stuff here
      const response = [];
      let tempResponse = [];
      let recursiveResponse = [];

      const tempType = this.definitions["@graph"].find((iterType) => {
        return iterType["@id"] === type;
      });


      if (tempType["rdfs:subClassOf"]) {
        if (tempType["rdfs:subClassOf"].length) {
          tempType["rdfs:subClassOf"].map((subclass) => {

            recursiveResponse = recursiveResponse.concat(this.getPossibleProperties(subclass["@id"]));
          });
        }
        else {
          recursiveResponse = this.getPossibleProperties(tempType["rdfs:subClassOf"]["@id"]);
        }
      }

      let tempAsdf = this.definitions["@graph"].filter((property) => {

        if (types.includes(property["@type"]) && (property["@id"].includes("iot-lite") || property["@id"].includes(type.split(/:/)[0]))) {
          if (property["rdfs:domain"]) {
            return property["rdfs:domain"]["@id"] == type;
          }
          else {
            return true;
          }
          if (property["rdfs:range"]) {
            return property["rdfs:range"]["@id"] == type;
          }
          else {
            return true;
          }
        }
      });

      tempAsdf = tempAsdf.map((item) => {
        return item["@id"].split(/:|#/).slice(-1)[0];
      });


      tempResponse = recursiveResponse.concat(tempAsdf);

      return tempResponse
    }


    // Returns all devices
    getAllDevices() {
        return this.model["@graph"];
    }

    // ##### Save and load whole Models ################################################################################


    // Receive model from server and set it to frontend model
    loadModel(name) {
        backend.fire_ajax_load(name);
        //this.setModel(/* call Backend API getModel(id) */);
    }

    saveModel(title) {
        // call Backend API saveModel(this.model["@graph"], title);
        backend.fire_ajax_save(title, this.model);
        this.emit("change");
    }


    importModel(data) {
        const convertedModel = data;
        if (true /* type not json */) {
            // convertedModel = transformModelFrom(data, <format of newModel>);
        }
        this.setModel(convertedModel);
    }

    exportModel(format) {
        // return transformModelTo(this.getModel(), format);
        backend.fire_ajax_export(format, this.getModel());
    }

    // ----- Helper Methods ---------------------------------------------------
    // Writes given model (by Server or User) to the model
    setModel(newModel) {
        this.model = newModel;


        this.emit("change");
    }

    // Returns model for storing or exporting it
    getModel() {
        return this.model;
    }

    getSavedModels() {
        return this.savedModels;
    }

    setSelectedDevice(id) {


      this.selectedDevice = id;

      this.emit("change");
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
        this.model["@graph"] = [];
        this.emit("change");
    }

    openSetProperty() {
      this.isSetPropertyOpen = true;
      this.emit("change");
    }

    closeSetProperty() {
      this.isSetPropertyOpen = false;
      this.emit("change");
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
                this.setProperty(action.id, action.property, action.value, action.key);
                break;
            }
            case "DELETE_PROTERTY": {
                this.deleteProperty(action.id, action.property);
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
            case "SELECT_DEVICE": {
                this.setSelectedDevice(action.id);
                break;
            }
            case "ADD_DEVICE_TYPE": {
                this.addDeviceType(action.id);
                break;
            }
            case "CLEAR_DEVICES": {
                this.clearDevices();
                break;
            }
            case "OPEN_SET_PROPERTY": {
                this.openSetProperty();
                break;
            }
            case "CLOSE_SET_PROPERTY": {
                this.closeSetProperty();
                break;
            }
        }
    }
}

const deviceStore = new DeviceStore;
dispatcher.register(deviceStore.handleActions.bind(deviceStore));

export default deviceStore;
