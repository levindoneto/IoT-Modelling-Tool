{
  "@context": {
    "fiesta-res": "http://purl.org/NET/fiesta-res#",
    "geo": "http://www.w3.org/2003/01/geo/wgs84_pos#",
    "iot-lite": "http://purl.oclc.org/NET/UNIS/fiware/iot-lite#",
    "m3-lite": "http://purl.org/iot/vocab/m3-lite#",
    "owl": "http://www.w3.org/2002/07/owl#",
    "qu": "http://purl.org/NET/ssnx/qu/qu#",
    "qu-rec20": "http://purl.org/NET/ssnx/qu/qu-rec20#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "sc": "http://purl.org/NET/sc#",
    "ssn": "http://purl.oclc.org/NET/ssnx/ssn#",
    "time": "http://www.w3.org/2006/time#",
    "xsd": "http://www.w3.org/2001/XMLSchema#"
  },
  "@graph": [
    {
      "@id": "sc:SensingDevice1Service",
      "@type": "iot-lite:Service",
      "iot-lite:endpoint": "http://131.227.92.112:8080/SmartCCSR-testbed/restful-services/REDUCE/json/sensors/1SensingDevice1Service"
    },
    {
      "@id": "sc:ICS-Desk1",
      "@type": "ssn:Platform",
      "geo:location": {
        "@id": "sc:CII-UNIS-GU2-UK-ICS-Desk1"
      }
    },
    {
      "@id": "sc:CII-UNIS-GU2-UK-ICS-Desk1",
      "@type": "geo:Point",
      "geo:lat": "51.4",
      "geo:long": "-0.51"
    },
    {
      "@id": "fiesta-res:IoT-Node1",
      "@type": "ssn:Device",
      "ssn:hasSubSystem": {
        "@id": "fiesta-res:IoT-Node1TEMPERATURE"
      }
    },
    {
      "@id": "fiesta-res:IoT-Node1TEMPERATURE",
      "@type": "ssn:SensingDevice",
      "iot-lite:hasQuantityKind": {
        "@id": "m3-lite:Temperature"
      },
      "iot-lite:isExposedBy": {
        "@id": "sc:SensingDevice1Service"
      },
      "iot-lite:isSubSystemOf": {
        "@id": "sc:smart-ics"
      },
      "ssn:onPlatform": {
        "@id": "sc:ICS-Desk1"
      }
    },
    {
      "@id": "sc:SmartCampus",
      "@type": "ssn:System"
    },
    {
      "@id": "sc:smart-ics",
      "@type": "ssn:System",
      "iot-lite:isSubSystemOf": {
        "@id": "sc:SmartCampus"
      }
    }
  ]
}
