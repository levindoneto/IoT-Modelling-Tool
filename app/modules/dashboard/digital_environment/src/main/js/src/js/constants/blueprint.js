const blueprint = {
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
        "ipvs": "http://www.ipvs.uni-stuttgart.de/iot-lite#"
    },
    "@graph": [
      {
        "@id": "ipvs:raspberry-pi",
        "@type": "ssn:Device",
        "ssn:onPlatform": {
          "@id": "ipvs:raspberry-pi-platform"
        },
        "iot-lite:isSubSystemOf": {
          "@id": ""
        },
        "iot-lite:hasMetadata": {
          "@id": "ipvs:raspberry-pi-mac-address"
        }
      },
      {
        "@id": "ipvs:raspberry-pi-platform",
        "@type": "ssn:Platform",
        "geo:location": {
          "@id": "ipvs:raspberry-pi-location"
        }
      },
      {
        "@id": "ipvs:raspberry-pi-location",
        "@type": "geo:Point",
        "geo:lat": "",
        "geo:long": ""
      },
      {
        "@id": "ipvs:raspberry-pi-mac-address",
        "@type": "iot-lite:Metadata",
        "iot-lite:metadataValue": "",
        "iot-lite:metadataType": "mac-address"
      },
      {
        "@id": "ipvs:temperature-sensing-device",
        "@type": "ssn:SensingDevice",
        "ssn:onPlatform": {
          "@id": "ipvs:temperature-sensing-device-platform"
        },
        "ssn:hasQuantityKind": {
          "@id": "m3-lite:Temperature"
        },
        "ssn:hasUnit": {
          "@id": "qu:degree_Celsius"
        },
        "iot-lite:isSubSystemOf": {
          "@id": ""
        },
        "iot-lite:hasMetadata": {
          "@id": "ipvs:temperature-sensing-device-mac-address"
        }
      },
      {
        "@id": "ipvs:temperature-sensing-device-mac-address",
        "@type": "iot-lite:Metadata",
        "iot-lite:metadataValue": "",
        "iot-lite:metadataType": "mac-address"
      },
      {
        "@id": "ipvs:temperature-sensing-device-platform",
        "@type": "ssn:Platform",
        "geo:location": {
          "@id": "ipvs:temperature-sensing-device-location"
        }
      },
      {
        "@id": "ipvs:temperature-sensing-device-location",
        "@type": "geo:Point",
        "geo:lat": "",
        "geo:long": ""
      },
      {
        "@id": "ipvs:actuating-device",
        "@type": "iot-lite:ActuatingDevice",
        "ssn:onPlatform": {
          "@id": "ipvs:actuating-device-platform"
        },
        "iot-lite:isSubSystemOf": {
          "@id": ""
        },
        "iot-lite:hasMetadata": {
          "@id": "ipvs:actuating-device-mac-address"
        }
      },
      {
        "@id": "ipvs:actuating-device-platform",
        "@type": "ssn:Platform",
        "geo:location": {
          "@id": "ipvs:actuating-device-location"
        }
      },
      {
        "@id": "ipvs:actuating-device-location",
        "@type": "geo:Point",
        "geo:lat": "",
        "geo:long": ""
      },
      {
        "@id": "ipvs:actuating-device-mac-address",
        "@type": "iot-lite:Metadata",
        "iot-lite:metadataValue": "",
        "iot-lite:metadataType": "mac-address"
      }
    ]
}

const editableProperties = ["iot-lite:isSubSystemOf", "iot-lite:metadataValue", "@id"];

export { blueprint, editableProperties };
