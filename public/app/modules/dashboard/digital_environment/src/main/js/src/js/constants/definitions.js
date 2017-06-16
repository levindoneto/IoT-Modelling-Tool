import fire from '../database/fire' // Database to be accessed for this part of the application
import reactfire from 'reactfire' // Binding between the database and reactjs

var lst_devices   = []; // list_infos_devices.type == "device"
var lst_sensors   = []; // list_infos_devices.type == "sensor"
var lst_actuators = []; // list_infos_devices.type == "actuator"

var aux_device;
var aux_sensor;
var aux_actuator;

function Component(childSnapValue) {
    this.numberOfPins = childSnapValue.NumberOfPins;
    this.id = childSnapValue.id;
    this.imageFileKey = childSnapValue.imageFile; // This key is used to access the correct image in the another data structure
    this.ownerUser = childSnapValue.userUid;
}


const one_id_random = "RASPTEST";
const prefixIPVS = "ipvs:";

// Reading the data from the database (key: "models")
firebase.database().ref("models").orderByKey().once("value")
.then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {  // Loop into database's information
    //var key = childSnapshot.key;
        switch (childSnapshot.val().type) {
            case "device":
                aux_device = new Component(childSnapshot.val());
                lst_devices.push(aux_device);
                break;
            case "sensor":
                aux_sensor = new Component(childSnapshot.val());
                lst_sensors.push(aux_sensor);
                break;
            case "actuator":
                aux_actuator = new Component(childSnapshot.val());
                lst_actuators.push(aux_actuator);
                console.log("LUANS: ", lst_actuators[0].ownerUser);
                break;
            default:
                aux_device = new Component(childSnapshot.val());
                lst_devices.push(aux_device);
        }
    });
});

alert(lst_actuators);

const definitions = {
    "@context": {
        "geo": "http://www.w3.org/2003/01/geo/wgs84_pos#",
        "m3-lite": "http://purl.org/iot/vocab/m3-lite#",
        "owl": "http://www.w3.org/2002/07/owl#",
        "qu": "http://purl.org/NET/ssnx/qu/qu#",
        "qu-rec20": "http://purl.org/NET/ssnx/qu/qu-rec20#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "ssn": "http://purl.oclc.org/NET/ssnx/ssn#",
        "time": "http://www.w3.org/2006/time#",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "iot-lite": "http://purl.oclc.org/NET/UNIS/fiware/iot-lite#",
        "ipvs": "http://www.ipvs.uni-stuttgart.de/iot-lite#",
        "ipvs:hasPin": {
            "@id": "ipvs:hasPin",
            "@container": "@list"
        }
    },
    "@graph": [
        {
            "@id": "iot-lite:altRelative",
            "@type": "owl:AnnotationProperty",
            "rdfs:domain": {
                "@id": "geo:Point"
            },
            "rdfs:range": {
                "@id": "xsd:string"
            }
        },
        {
            "@id": "geo:alt",
            "@type": "owl:AnnotationProperty",
            "rdfs:domain": {
                "@id": "geo:Point"
            }
        },
        {
            "@id": "iot-lite:Service",
            "@type": "owl:Class",
            "rdfs:comment": {
                "@language": "en",
                "@value": "Service provided by an IoT Device"
            }
        },
        {
            "@id": "iot-lite:exposedBy",
            "@type": "owl:ObjectProperty",
            "rdfs:comment": "A device is exposed by a service.",
            "rdfs:domain": {
                "@id": "ssn:Device"
            },
            "rdfs:range": {
                "@id": "iot-lite:Service"
            }
        },
        {
            "@id": "iot-lite:endpoint",
            "@type": "owl:DatatypeProperty",
            "rdfs:comment": "Endpoint of the service. It is usually a URL where the service is available.",
            "rdfs:domain": {
                "@id": "iot-lite:Service"
            },
            "rdfs:range": {
                "@id": "xsd:anyURI"
            }
        },
        {
            "@id": "geo:location",
            "@type": "owl:ObjectProperty",
            "rdfs:range": {
                "@id": "geo:Point"
            }
        },
        {
            "@id": "iot-lite:isAssociatedWith",
            "@type": "owl:ObjectProperty",
            "rdfs:comment": "Defines the associations between objects and sensors (e.g. A table (object) has an attribute (temperature at the table) which is associated with a sensor (the temperature sensor of the room). ",
            "rdfs:domain": [
                {
                    "@id": "iot-lite:Object"
                },
                {
                    "@id": "iot-lite:Entity"
                }
            ],
            "rdfs:range": {
                "@id": "iot-lite:Service"
            }
        },
        {
            "@id": "iot-lite:VirtualEntity",
            "@type": "owl:Class",
            "rdfs:subClassOf": {
                "@id": "iot-lite:Entity"
            }
        },
        {
            "@id": "iot-lite:interfaceType",
            "@type": "owl:DatatypeProperty",
            "rdfs:comment": "Defines the type of interface of the service endpoint.",
            "rdfs:domain": {
                "@id": "iot-lite:Service"
            },
            "rdfs:range": {
                "@id": "xsd:string"
            }
        },
        {
            "@id": "iot-lite:Attribute",
            "@type": "owl:Class",
            "rdfs:comment": {
                "@language": "en",
                "@value": "An attribute of an IoT object that can be exposed by an IoT service (i.e. a room (IoT Object) has a temperature (Attribute), that can be exposed by a temperature sensor (IoT device)."
            }
        },
        {
            "@id": "ssn:SensingDevice",
            "@type": "owl:Class",
            "rdfs:subClassOf": [
                {
                    "@id": "ssn:Sensor"
                },
                {
                    "@id": "ssn:Device"
                }
            ]
        },
        {
            "@id": "iot-lite:hasMetadata",
            "@type": "owl:ObjectProperty",
            "rdfs:comment": "Links any concept with metadata about that concept.",
            "rdfs:range": {
                "@id": "iot-lite:Metadata"
            }
        },
        {
            "@id": "ssn:Platform",
            "@type": "owl:Class"
        },
        {
            "@id": "qu:Unit",
            "@type": "owl:Class"
        },
        {
            "@id": "iot-lite:metadataValue",
            "@type": "owl:DatatypeProperty",
            "rdfs:comment": "Value of the metadata",
            "rdfs:domain": {
                "@id": "iot-lite:Metadata"
            },
            "rdfs:range": {
                "@id": "xsd:string"
            }
        },
        {
            "@id": "iot-lite:hasAttribute",
            "@type": "owl:ObjectProperty",
            "rdfs:comment": "Links the devices with their attributes.",
            "rdfs:domain": [
                {
                    "@id": "iot-lite:Object"
                },
                {
                    "@id": "iot-lite:Entity"
                }
            ],
            "rdfs:range": {
                "@id": "iot-lite:Attribute"
            }
        },
        {
            "@id": "iot-lite:interfaceDescription",
            "@type": "owl:DatatypeProperty",
            "rdfs:comment": "Description of the service.",
            "rdfs:domain": {
                "@id": "iot-lite:Service"
            },
            "rdfs:range": {
                "@id": "xsd:anyURI"
            }
        },
        {
            "@id": "iot-lite:Object",
            "@type": "owl:Class",
            "rdfs:comment": {
                "@language": "en",
                "@value": "IoT entity"
            }
        },
        {
            "@id": "iot-lite:relativeLocation",
            "@type": "owl:AnnotationProperty",
            "rdfs:domain": {
                "@id": "geo:Point"
            },
            "rdfs:range": {
                "@id": "xsd:string"
            }
        },
        {
            "@id": "iot-lite:",
            "@type": "owl:Ontology",
            "owl:versionInfo": "0.3 fiesta",
            "rdfs:comment": {
                "@language": "en",
                "@value": "iot-lite is a lightweight ontology based on SSN to describe Internet of Things (IoT) concepts and relationships."
            },
            "rdfs:label": "iot-lite"
        },
        {
            "@id": "iot-lite:metadataType",
            "@type": "owl:DatatypeProperty",
            "rdfs:comment": "Defines the type pf the metadata value (e.g. resolution of the sensor).",
            "rdfs:domain": {
                "@id": "iot-lite:Metadata"
            },
            "rdfs:range": {
                "@id": "xsd:string"
            }
        },
        {
            "@id": "ssn:System",
            "@type": "owl:Class"
        },
        {
            "@id": "geo:Point",
            "@type": "owl:Class",
            "geo:alt": "",
            "geo:lat": "",
            "geo:long": "",
            "iot-lite:altRelative": "",
            "iot-lite:relativeLocation": ""
        },
        {
            "@id": "qu:QuantityKind",
            "@type": "owl:Class"
        },
        {
            "@id": "ssn:hasSubSystem",
            "@type": "owl:ObjectProperty",
            "rdfs:domain": {
                "@id": "ssn:System"
            },
            "rdfs:range": {
                "@id": "ssn:System"
            }
        },
        {
            "@id": "iot-lite:Metadata",
            "@type": "owl:Class",
            "rdfs:comment": {
                "@language": "en",
                "@value": "Class used to describe properties that cannot be described by QuantityKind and Units. i.e. the resolution of a sensor."
            }
        },
        {
            "@id": "iot-lite:Polygon",
            "@type": "owl:Class",
            "rdfs:comment": {
                "@language": "en",
                "@value": "The coverage is made up by linking several points by strait lines."
            },
            "rdfs:subClassOf": {
                "@id": "iot-lite:Coverage"
            }
        },
        {
            "@id": "iot-lite:radius",
            "@type": "owl:DatatypeProperty",
            "rdfs:comment": "Specifies the radius of a circle coverage defined by a point -the center of the circle- and its radius.",
            "rdfs:domain": {
                "@id": "iot-lite:Circle"
            },
            "rdfs:range": {
                "@id": "xsd:double"
            }
        },
        {
            "@id": "geo:lat",
            "@type": "owl:AnnotationProperty",
            "rdfs:domain": {
                "@id": "geo:Point"
            }
        },
        {
            "@id": "iot-lite:Coverage",
            "@type": "owl:Class",
            "rdfs:comment": {
                "@language": "en",
                "@value": "The coverage of an IoT device (i.e. a temperature sensor inside a room has a coverage of that room)."
            }
        },
        {
            "@id": "iot-lite:TagDevice",
            "@type": "owl:Class",
            "rdfs:comment": {
                "@language": "en",
                "@value": "Tag Device such as QR code or bar code."
            },
            "rdfs:subClassOf": {
                "@id": "ssn:Device"
            }
        },
        {
            "@id": "iot-lite:exposes",
            "@type": "owl:ObjectProperty",
            "owl:inverseOf": {
                "@id": "iot-lite:exposedBy"
            },
            "rdfs:comment": "For service-oriented queries. The inverse of exposedBy.",
            "rdfs:domain": {
                "@id": "iot-lite:Service"
            },
            "rdfs:range": {
                "@id": "ssn:Device"
            }
        },
        {
            "@id": "ssn:onPlatform",
            "@type": "owl:ObjectProperty",
            "rdfs:domain": {
                "@id": "ssn:System"
            },
            "rdfs:range": {
                "@id": "ssn:Platform"
            }
        },
        {
            "@id": "iot-lite:Entity",
            "@type": "owl:Class",
            "owl:equivalentClass": {
                "@id": "iot-lite:Object"
            }
        },
        {
            "@id": "iot-lite:hasSensingDevice",
            "@type": "owl:ObjectProperty",
            "rdfs:comment": "Links a sensor with a sensing device the same way as SSN.",
            "rdfs:domain": {
                "@id": "ssn:Sensor"
            },
            "rdfs:range": {
                "@id": "ssn:SensingDevice"
            }
        },
        {
            "@id": "iot-lite:hasCoverage",
            "@type": "owl:ObjectProperty",
            "rdfs:comment": "Links the devices with their coverages.",
            "rdfs:domain": {
                "@id": "ssn:Device"
            },
            "rdfs:range": {
                "@id": "iot-lite:Coverage"
            }
        },
        {
            "@id": "iot-lite:isSubSystemOf",
            "@type": "owl:ObjectProperty",
            "owl:inverseOf": {
                "@id": "ssn:hasSubSystem"
            },
            "rdfs:domain": {
                "@id": "ssn:System"
            },
            "rdfs:range": {
                "@id": "ssn:System"
            }
        },
        {
            "@id": "ssn:Sensor",
            "@type": "owl:Class"
        },
        {
            "@id": "iot-lite:hasQuantityKind",
            "@type": "owl:ObjectProperty",
            "rdfs:comment": "Links a sensor or an attribute with the quantity  kind it measures (e.g. A sensor -sensor1- measures temperature: sensor1 hasQuantityKind temperature).",
            "rdfs:domain": [
                {
                    "@id": "iot-lite:Attribute"
                },
                {
                    "@id": "ssn:Sensor"
                }
            ],
            "rdfs:range": {
                "@id": "qu:QuantityKind"
            }
        },
        {
            "@id": "iot-lite:hasUnit",
            "@type": "owl:ObjectProperty",
            "rdfs:comment": "Links the sensor with the units of the quantity kind it measures (e.g. A sensor -sensor1- measures temperature in Celsius: senso1 hasUnit celsius).",
            "rdfs:domain": {
                "@id": "ssn:Sensor"
            },
            "rdfs:range": {
                "@id": "qu:Unit"
            }
        },
        {
            "@id": "iot-lite:Rectangle",
            "@type": "owl:Class",
            "rdfs:comment": {
                "@language": "en",
                "@value": "Teh coverage is made up by giving two points which are the oposite corners of a rentangle."
            },
            "rdfs:subClassOf": {
                "@id": "iot-lite:Coverage"
            }
        },
        {
            "@id": "iot-lite:id",
            "@type": "owl:DatatypeProperty",
            "rdfs:domain": {
                "@id": "ssn:Device"
            },
            "rdfs:range": {
                "@id": "xsd:string"
            }
        },
        {
            "@id": "geo:long",
            "@type": "owl:AnnotationProperty",
            "rdfs:domain": {
                "@id": "geo:Point"
            }
        },
        {
            "@id": "iot-lite:Circle",
            "@type": "owl:Class",
            "rdfs:comment": {
                "@language": "en",
                "@value": "Circle coverage it needs the location of the sensor as the centre of the circle and the radius as a DataProperty."
            },
            "rdfs:subClassOf": {
                "@id": "iot-lite:Coverage"
            }
        },
        {
            "@id": "ssn:Device",
            "@type": "owl:Class",
            "rdfs:subClassOf": {
                "@id": "ssn:System"
            }
        },
        {
            "@id": "iot-lite:ActuatingDevice",
            "@type": "owl:Class",
            "rdfs:comment": {
                "@language": "en",
                "@value": "Device that can actuate over an object or QuantityKind."
            },
            "rdfs:subClassOf": {
                "@id": "ssn:Device"
            }
        },
        {
            "@id": "iot-lite:isMobile",
            "@type": "owl:DatatypeProperty",
            "rdfs:domain": {
                "@id": "ssn:Platform"
            },
            "rdfs:range": {
                "@id": "xsd:boolean"
            }
        },

        //##### Extensions of IoT-Lite Scheme for own Device-Types #####################################################
        {
            "@id": "ipvs:RaspberryPis",          // Define a RaspberryPi as SubClass of Device
            "@type": "owl:Class",
            "rdfs:subClassOf": [
                {
                    "@id": "ssn:Device"
                },
                {
                    "@id" : "ipvs:RaspberryPi-numberOfPins"
                }
            ]

        },
        {
            "@id": "ipvs:macAddress",     // Define the MacAdress property as Attribute of RaspberryPi
            "@type": "owl:DatatypeProperty",
            "rdfs:domain":{
                "@id":"ssn:Device"
            },
            "rdfs:range": {
                //"@id": "ipvs:MacAdress"
                "@id": "xsd:string"
            }
        },
        {
            "@id": "ipvs:numberOfPins",     // Define the MacAdress property as Attribute of RaspberryPi
            "@type": "owl:DatatypeProperty",
            "rdfs:comment": "To specify the number of pins on a device.",
            "rdfs:domain":{
                "@id":"ssn:Device"
            },
            "rdfs:range": {
                //"@id": "ipvs:MacAdress"
                "@id": "xsd:nonNegativeInteger"
            }
        },
        {
            "@id": "ipvs:gpioMode",     // Define the MacAdress property as Attribute of RaspberryPi
            "@type": "owl:DatatypeProperty",
            "rdfs:comment": "To specify how the GPIO pin numbers are supposed to be interpreted.",
            "rdfs:domain":{
                "@id":"ssn:Device"
            },
            "rdfs:range": {
                //"@id": "ipvs:MacAdress"
                "@id": "xsd:string"
            }
        },
        {
            "@id": "ipvs:modelNumber",     // Define the MacAdress property as Attribute of RaspberryPi
            "@type": "owl:DatatypeProperty",
            "rdfs:comment": "To specify whether it's a RPi model A or B.",
            "rdfs:domain":{
                "@id":"ssn:Device"
            },
            "rdfs:range": {
                //"@id": "ipvs:MacAdress"
                "@id": "xsd:string"
            }
        },
        {
            "@id": (prefixIPVS.concat(one_id_random)).toString(),          // Define a RaspberryPi as SubClass of Device
            "@type": "owl:Class",
            "rdfs:comment": "Temperature Sensor with 3 pins. GND - 1, DQ - 2, VDD -3. Datasheet: https://datasheets.maximintegrated.com/en/ds/DS18B20.pdf",
            "rdfs:subClassOf": [
                {
                    "@id": "ssn:SensingDevice"
                }
                ,
                {
                    "@id": "ipvs:DS18B20TEST-hasPin"
                }
            ]
        },
        {
            "@id": "ipvs:hasPin",     // Define the MacAdress property as Attribute of RaspberryPi
            "@type": "owl:DatatypeProperty",
            "rdfs:comment": "To list all pins of a device (sensor, actuator) and to what pins of the super-device they are connected to.",
            "rdfs:domain": {
                "@id":"ipvs:Device"
            },
            "rdfs:range": {
                "@id": "xsd:nonNegativeInteger"
            }
        },
        {
            "@id": "ipvs:L293D",          // Define a RaspberryPi as SubClass of Device
            "@type": "owl:Class",
            "rdfs:comment": "TI Microcontrollor with 16 pins to drive up to two motors. Datasheet: http://www.ti.com/lit/ds/symlink/l293.pdf",
            "rdfs:subClassOf": [
                {
                    "@id": "iot-lite:ActuatingDevice"
                },
                {
                    "@id": "ipvs:L293D-hasPin"
                }
            ]
        },
        {
            "@id" : "ipvs:RaspberryPi-numberOfPins",
            "@type": "owl:Restriction",
            "rdfs:comment": "OWL restriction specifying the number of pins of a raspberry pi.",
            "owl:onProperty": {
                "@id": "ipvs:numberOfPins"
            },
            "owl:cardinality": {
                "@value": "26",
                "@type": "xsd:nonNegativeInteger"
            }
        },
        {
            "@id" : "ipvs:DS18B20TEST-hasPin",
            "@type": "owl:Restriction",
            "owl:onProperty": {
                "@id":"ipvs:hasPin"
            },
            "owl:cardinality": {
                "@value": "3",
                "@type": "xsd:nonNegativeInteger"
            }
        },
        {
            "@id" : "ipvs:L293D-hasPin",
            "@type": "owl:Restriction",
            "owl:onProperty": {
                "@id":"ipvs:hasPin"
            },
            "owl:cardinality": {
                "@value": "16",
                "@type": "xsd:nonNegativeInteger"
            }
        }
    ]
}

export {definitions};
