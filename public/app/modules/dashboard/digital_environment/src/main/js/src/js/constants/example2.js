{
  "@context": {
    "geo": "http://www.w3.org/2003/01/geo/wgs84_pos#",
    "iot-l-Ins": "http://purl.oclc.org/NET/UNIS/iot-lite/iot-liteInstance#",
    "iot-lite": "http://purl.oclc.org/NET/UNIS/fiware/iot-lite#",
    "owl": "http://www.w3.org/2002/07/owl#",
    "qu": "http://purl.org/NET/ssnx/qu/qu#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "ssn": "http://www.w3.org/2005/Incubator/ssn/ssnx/ssn#",
    "xsd": "http://www.w3.org/2001/XMLSchema#"
  },
  "@graph": [
    {
      "@id": "iot-l-Ins:NEcornerRoom13CII01",
      "@type": [
        "geo:Point",
        "owl:NamedIndividual"
      ],
      "geo:lat": {
        "@type": "xsd:float",
        "@value": "51.2434"
      },
      "geo:long": {
        "@type": "xsd:float",
        "@value": "-0.59316"
      },
      "iot-lite:altRelative": "1stFloor"
    },
    {
      "@id": "iot-l-Ins:areaRoom13CII01",
      "@type": [
        "iot-lite:Rectangle",
        "owl:NamedIndividual"
      ],
      "iot-lite:hasPoint": [
        {
          "@id": "iot-l-Ins:NEcornerRoom13CII01"
        },
        {
          "@id": "iot-l-Ins:SWcornerRoom13CII01"
        }
      ]
    },
    {
      "@id": "iot-l-Ins:TelosB001",
      "@type": [
        "owl:NamedIndividual",
        "ssn:Device"
      ],
      "ssn:hasSubsystem": {
        "@id": "iot-l-Ins:temperatureSensorRoom13CII01"
      }
    },
    {
      "@id": "iot-l-Ins:SWcornerRoom13CII01",
      "@type": [
        "owl:NamedIndividual",
        "geo:Point"
      ],
      "geo:lat": {
        "@type": "xsd:float",
        "@value": "51.2433"
      },
      "geo:long": {
        "@type": "xsd:float",
        "@value": "-0.59315"
      },
      "iot-lite:altRelative": "1stFloor"
    },
    {
      "@id": "iot-l-Ins:locationRoom13CII01",
      "@type": [
        "owl:NamedIndividual",
        "geo:Point"
      ],
      "geo:lat": {
        "@type": "xsd:float",
        "@value": "51.243362"
      },
      "geo:long": {
        "@type": "xsd:float",
        "@value": "-0.593154"
      },
      "iot-lite:altRelative": "1stFloor"
    },
    {
      "@id": "iot-l-Ins:ngsi10SensorRoom13CII01",
      "@type": [
        "iot-lite:Service",
        "owl:NamedIndividual"
      ],
      "iot-lite:endpoint": {
        "@type": "xsd:anyURI",
        "@value": "http://surrey.ac.uk/sensors/measures/rom13CII01"
      },
      "iot-lite:interfaceDescription": {
        "@type": "xsd:anyURI",
        "@value": "http://surrey.ac.uk/sensors/measures/room13CII01"
      },
      "iot-lite:type": "ngsi-10"
    },
    {
      "@id": "iot-l-Ins:temperatureSensorRoom13CII01",
      "@type": [
        "owl:NamedIndividual",
        "ssn:SensingDevice"
      ],
      "iot-lite:exposedBy": {
        "@id": "iot-l-Ins:ngsi10SensorRoom13CII01"
      },
      "iot-lite:hasCoverage": {
        "@id": "iot-l-Ins:areaRoom13CII01"
      },
      "ssn:hasDeployment": {
        "@id": "iot-l-Ins:sensorRoom13CII01"
      }
    },
    {
      "@id": "iot-lite:temperatureTableRoom12CII01",
      "@type": [
        "owl:NamedIndividual",
        "iot-lite:Attribute"
      ],
      "iot-lite:hasQuantityKind": {
        "@id": "qu:temperature"
      },
      "iot-lite:isAssociatedWith": {
        "@id": "iot-l-Ins:temperatureSensorRoom13CII01"
      }
    },
    {
      "@id": "iot-l-Ins:temperatureSensorTelosB",
      "@type": [
        "owl:NamedIndividual",
        "ssn:Sensor"
      ],
      "iot-lite:hasMetadata": {
        "@id": "iot-l-Ins:resolution1024"
      },
      "iot-lite:hasQuantityKind": {
        "@id": "http://purl.org/NET/ssnx/qu/quantity#temperature"
      },
      "iot-lite:hasSensingDevice": {
        "@id": "iot-l-Ins:temperatureSensorRoom13CII01"
      },
      "iot-lite:hasUnit": {
        "@id": "qu:degree_Celsius"
      }
    },
    {
      "@id": "iot-l-Ins:UniSTestbed",
      "@type": [
        "owl:NamedIndividual",
        "ssn:System"
      ],
      "ssn:hasSubsystem": {
        "@id": "iot-l-Ins:TelosB001"
      }
    },
    {
      "@id": "iot-l-Ins:resolution1024",
      "@type": [
        "owl:NamedIndividual",
        "iot-lite:Metadata"
      ],
      "iot-lite:metadataValue": {
        "@type": "xsd:float",
        "@value": "1024.0"
      },
      "iot-lite:type": "resolution"
    },
    {
      "@id": "iot-lite:tableRoom13CII01",
      "@type": [
        "iot-lite:Object",
        "owl:NamedIndividual"
      ],
      "geo:hasLocation": {
        "@id": "iot-l-Ins:locationRoom13CII01"
      },
      "iot-lite:hasAttribute": {
        "@id": "iot-lite:tempreratureTableRoom12CII01"
      },
      "iot-lite:interfaceDescription": {
        "@type": "xsd:anyURI",
        "@value": "http://surrey.ac.uk/sensor/Room13CII01/Table"
      }
    },
    {
      "@id": "iot-l-Ins:sensorRoom13CII01",
      "@type": [
        "owl:NamedIndividual",
        "ssn:Deployment"
      ],
      "geo:hasLocation": {
        "@id": "iot-l-Ins:locationRoom13CII01"
      }
    }
  ]
}
