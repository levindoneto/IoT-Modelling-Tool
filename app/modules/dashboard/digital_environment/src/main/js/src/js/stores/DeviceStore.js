import {EventEmitter} from "events";
import dispatcher from "../dispatcher";
import {definitions} from "../constants/definitions";
import {blueprint} from "../constants/blueprint.js";
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
        this.blueprint = blueprint;
        this.selectedDevice = "";
    }

    // creates id witch is not used yet
    createId(type) {
        var id = 1;

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
        createdLocation["@id"] = device.type + "-Location-" + id.toString();
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

            if ( restriction != null ) {
              createdDevice["ipvs:numberOfPins"] = parseInt(restriction["owl:cardinality"]["@value"]);
              createdDevice["ipvs:gpioMode"] = "GPIO.BOARD";
            }
          }
        }
        // device is a "primitive" (i.e. has no mac address) - a sensor or an actuator
        else {
          // set subsystem to self, so that it is not deleted when exporting
          createdDevice["iot-lite:isSubSystemOf"] = {};
          createdDevice["iot-lite:isSubSystemOf"]["@id"] = createdDevice["@id"];

          createdDevice["ipvs:hasPin"] = [];

          if ( restrictionId.length > 0 ) {
            const restriction = restrictions.find((findRestriction) => (findRestriction["@id"] === restrictionId));

            if ( restriction != null ) {
              const index  = parseInt(restriction["owl:cardinality"]["@value"]);

              // set pins to their identical number so we don't get troubes in the List
              for (let i = 0; i < index; i++) {
                createdDevice["ipvs:hasPin"].push(i);
              }
            }
          }

        }

        // automatically create needed objects to be referenced in properties

        // iterate properties and return the ones, that reference potential devices that need to be created
        // const tempProperties = this.definitions["@graph"].filter((iterObject) => {
        //   return iterObject["rdfs:domain"] != null && iterObject["rdfs:domain"]["@id"] == device.type;
        // });
        //
        // // are there devices that need to be created?
        // if (tempProperties.length > 0) {
        //   // getting device names
        //   const deviceNames = tempProperties.filter((filterProperty) =>
        //     (filterProperty["rdfs:range"] != null && !filterProperty["rdfs:range"]["@id"].startsWith("xsd:"))
        //   ).map((mapProperty) =>
        //     (mapProperty[["rdfs:range"]]["@id"])
        //   );
        //
        //   if (deviceNames.length > 0)
        //     deviceNames.map((iterName) => {
        //       const tempCreatedDeviceName = this.createDevice({type: iterName});
        //       const tempPropertyName = tempProperties.filter((iterProperty) => {
        //         return iterProperty["rdfs:range"]["@id"] === iterName;
        //       })[0];
        //       createdDevice[tempPropertyName]["@id"] = tempCreatedDeviceName;
        //     });
        //   else
        //   tempProperties.map((iterProperty) => {
        //     createdDevice[iterProperty["@id"]] = "";
        //   });
        //
        // }

        // push device into model
        this.model["@graph"].push(createdDevice);
        console.log(this.model["@graph"])

        this.emit("change");

        return createdDevice["@id"];
    }

    // Deletes the device with the given id from the model
    deleteDevice(id, isRecursion) {
      const tempRegExp = id.match(new RegExp("\\d+"))

      // every device ends with digits
      if (tempRegExp) {
        const tempIndex = tempRegExp[1];
        const tempId = id.substring(0, tempIndex);


        var tempDevice = this.model["@graph"].find(function (device) {
            return device["@id"] == tempId;
        });

        const tempProperties = Object.keys(tempDevice).filter((iterKey) => {
          return tempDevice[iterKey]["@id"] && !["iot-lite:isSubSystemOf", "ssn:hasQuantityKind", "ssn:hasUnit"].includes(iterKey);
        });

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
      				device[attribute]["@id"] = device["@id"];
            }
          });
    		  return device;
        });

        if (!isRecursion)
          this.emit("change");
      }
    }



    // Helper-Method: Check if the given type has the given property in Blueprint or Definition
    checkProperty(type, property){
        var hasThisProperty = false;

        const blueprintDevices = this.blueprint["@graph"].find(function(object) {

          if (object["@id"] == type) {
            return object[property] != null;
          }
        });

        if (blueprintDevices)
          return true;

        const definitionsDevices = this.definitions["@graph"].find(function(object) {

          if (object["@id"] == type) {
            return object[property] != null;
          }
        });

        if (definitionsDevices)
          return true;


        // for (let devicetype of this.blueprint["@graph"]) {  // ueber alle definierten Devices im Blueprint itierieren
        //     if (devicetype = type) {
        //         for (deviceproperty of devicetype) {    // ueber alle Eigenschaften dieses Devices iteriren
        //             if (deviceproperty = property) {
        //                 hasThisProperty = true;
        //                 console.log("Property found in Blueprint.")
        //                 break;                          // Property in Blueprint gefunden
        //             }
        //         }
        //         if (!hasThisProperty) {                               // Wenn nicht in Blueprint definiert, dann prüfen, ob Property der Oberklasse (Typdefinition in Definition)
        //             for (classdefinition of this.definitions["@graph"]) {     // ueber alle definierten Klassen (classdefinition) iterieren
        //                 if(classdefinition = devicetype){             // diese definierte Klasse ist die gesuchte
        //                     for (classproperty of classdefinition) {      // ueber alle Eigenschaften dieser Klasse iteriren
        //                         if (classproperty = property) {
        //                             hasThisProperty = true;
        //                             console.log("Property found in Definitions.")
        //                             break;                            // Property in Definitions gefunden
        //                         }
        //                     }
        //                     break;                                    // Devicetyp in Definitions gefunden, aber nicht die Property
        //                 }
        //             }
        //         }
        //         break;                        // Abbruch: Device gefunden, aber diese property wird weder in Blueprint noch definitions definiert.
        //     }
        // }

        return false;
        // return hasThisProperty;
    }

    // Sets given property to the given value of the device with the given id. If the propertz does not exist, it will be created.
    setProperty(id, property, value, key) {
        // Typ von device mit dieser ID in Erfahrung bringen
        // var type = "";
        // for (let device of this.model["@graph"]) {
        //     if (device["@id"] == id) {
        //         type = device["@type"];
        //         break;
        //     }
        // }

        // Device, whose property we are setting
        let tempDevice = this.model["@graph"].find(function(object) {
          return object["@id"] === id;
        });

        if (tempDevice["@type"] == "") {
            console.log("No device having this id found.");
        }


        // Nachschauen, ob dieser Typ die gegebene Property besitzt
        // var hasThisProperty = this.checkProperty(tempDevice["@type"] , property);


        // property object in definitions
        const tempProperty = this.definitions["@graph"].find(function(object) {
          return object["@id"].includes(property);
        });


        if (tempProperty) {

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
            });
          });
        }


            //
            // // see, if, the object we are referencing, already exists
            // const tempObject = this.model["@graph"].find((object) => {
            //   return object["@id"] == value;
            // });
            //
            // // if not, create it
            // if (tempObject == null) {
            //   this.createDevice({ type: tempProperty["rdfs:range"], id: value });
            // }
            //
            // console.log("Property has been set successfully.");

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
      var response = [];
      var tempResponse = [];
      var recursiveResponse = [];

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

      var tempAsdf = this.definitions["@graph"].filter((property) => {

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
    // getPossibleProperties() {
    //     var properties = [];
    //     const types = ["owl:AnnotationProperty", "owl:DatatypeProperty"];
    //     for (let element of this.model["@graph"]) {
    //         if (types.includes(element["@type"])) {
    //             var id = element["@id"];
    //             var partsOfString = id.split(/:|#/);      // split String at : or #
    //             var suffix = partsOfString.slice(-1);     // get only the last substring
    //             properties.push(suffix);
    //         }
    //     }
    //     return properties;
    // }

    // Returns all properties listed in the definition of the given device type.
    getPropertiesFromDeviceBlueprint(type) {
        for (let device of this.blueprint["@graph"]) {
            if (type == device["@id"]) {
                return device;
            }
        }
    }

    getPossiblePropertiesOfDevice(type) {
      const tempBluePrintDevice = this.blueprint["@graph"].find(function (object) {
          return object["@id"] === type;
      });

      if (!tempBluePrintDevice) {
        const tempDefinitionsDevice = this.definitions["@graph"].find(function (object) {
            return object["@id"] === type;
        });

        return Object.keys(tempDefinitionsDevice);
      }
      else {
        const tempDefinitionsDevice = this.definitions.find(function (object) {
            return object["@type"] === tempBluePrintDevice["@type"];
        });

        return Object.keys(tempBluePrintDevice).concat(Object.keys(tempDefinitionsDevice));
      }
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
        var convertedModel = data;
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

      console.log("selecting")
      console.log(id)

      this.selectedDevice = id;

      this.emit("change");
    }

    getSelectedDevice() {
      return this.selectedDevice;
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
            /*
            case "GET_PROPERTIES_FROM_DEVICE_BLUEPRINT": {
                this.getPropertiesFromDeviceBlueprint(action.deviceType);
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
        }
    }
}

const deviceStore = new DeviceStore;
dispatcher.register(deviceStore.handleActions.bind(deviceStore));

export default deviceStore;
