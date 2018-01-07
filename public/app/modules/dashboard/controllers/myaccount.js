
var allIcons = {}; //Object with the icons of the devices (basis 64)
var obj_identification = {};
var obj_properties = {};
const default_properties = [
    'id',
    'imageFile',
    'ontology',
    'owlRestriction',
    'prefixCompany',
    'rdfsComment',
    'type',
    'userUid'];
const lstComponenents = {
    Device: [], // list_infos_Devices.type == "Device"
    SensingDevice: [], // list_infos_devices.type == "SensingDevice"
    ActuatingDevice: [], // list_infos_devices.type == "ActuatingDevice"
};
var at_context = {};
var definitions = {};
const DEFINITIONS_KEY = 'definitions';
const PIN_CONF_PROP = 'pinConfiguration';

/*********************************************************/
/************************ Objects ************************/
/*********************************************************/

/* Object with default context indormation
 * The default information should have all properies defined
 */
function objContext(elementDefaultContext) {
    this.geo = elementDefaultContext.geo;
    this['m3-lite'] = elementDefaultContext['m3-lite'];
    this.owl = elementDefaultContext.owl;
    this.qu = elementDefaultContext.qu;
    this['qu-rec20'] = elementDefaultContext['qu-rec20'];
    this.rdf = elementDefaultContext.rdf;
    this.rdfs = elementDefaultContext.rdfs;
    this.ssn = elementDefaultContext.ssn;
    this.time = elementDefaultContext.time;
    this.xsd = elementDefaultContext.xsd;
    this['iot-lite'] = elementDefaultContext['iot-lite'];
    // For non-default information, another method is called
}

/* Object with identification information about a device or component,
 * as id, type and additional properties
 */
function identificationDevice(elementIdentDevice, elementRdfsSubClassOf) {
    this['@id'] = elementIdentDevice.id;
    this['@type'] = elementIdentDevice.type;
    this['rdfs:subClassOf'] = elementRdfsSubClassOf; // List of objects with information as type, number of pins, and so on
}

/*****************************************************/
/********************** Functions ********************/
/******* to create/update definitions' objects *******/
/*****************************************************/

/* Function that creates the object context based on the one set by the user as default
 * @parameters: callback function: createGraph() for iot-lite purposes
 * @return: Creation of the object definitions with the the object definitions' updating  with an object
 */
function createContext(callback) {
    // Getting the default @context key (defaults->defaultcontext)
    firebase.database().ref('defaults/defaultcontext').orderByKey().once('value')
    .then((snapshot) => {
        let keyDefaultContext = snapshot.val(); // snapshot.val() contains the value (string) with the key of the default context
        
        firebase.database().ref('contexts/'+keyDefaultContext).orderByKey().once('value') // Accessing the object of the default context
        .then((snapshot) => {
            window.definitions['@context'] = snapshot.val(); /* The whole context object is built based on the default @context 
                                                              * set by the user is being set on the global definitions object */
            localStorage.setItem('definitions', JSON.stringify(window.definitions)); /* Initializing definitions with the @context, 
                                                                                      * this is an variable of type string, which 
                                                                                      * needs to be converted to object afterwards */
            /* The object has to be built and armazened on the local storage during the execution,
             * otherwise undefined variables appear because of the asynchronous execution */
        });
    });
    return callback(); // createGraph() is executed right after createContext() has been finished
}

/* Function to create/update the list graph
 * @parameters: void, all the parameters are gotten from the database in real-time
 * @return: Updating of the object definitions with a list
 * This function ought to be called after createContext(), since this one also
 * creates the object definitions, which should be update by the @graph list (generated
 * by createGraph())
 */
function createGraph() {
    // Getting the default @graph key (defaults->defaultgraph)
    firebase.database().ref('defaults/defaultgraph').orderByKey().once('value')
    .then((snapshot) => {
        const keyDefaultGraph = snapshot.val(); // snapshot.val() contains the value (string) with the key of the default graph
        firebase.database().ref(`graphs/${keyDefaultGraph}`).orderByKey().once('value') // Accessing the object of the default graph, `graphs/${keyDefaultGraph}` = 'graphs'+keyDefaultGraph on ES6
        .then((snapshot) => {
            const listDefaultElements = Object.values(JSON.parse(snapshot.val().defaultobjectsgraph)['@graph']); // List with the default elements (object->list)
            
            // Retrieving the current definitions (just with the element @context) from the local storage
            const currentDefinitions = localStorage.getItem('definitions');
            const objCurrentDefinitions = JSON.parse(currentDefinitions);
            objCurrentDefinitions['@graph'] = listDefaultElements; // Updating the object definitions with the @graph elements
            localStorage.setItem('definitions', JSON.stringify(objCurrentDefinitions)); // Updating the local storage with the new definitions object 
        });
    });
    logInit();
}
/* Function to create the list rdfs
 *     this list contains at least one object:
 *         -> One with the information about the ontology and the type of the device or component
 *     also, it might have more objects. The amount of other objects depends on
 *         the number of additional properties that the device/component has.
 * This function is called for each device/component, and the device might have
 *     more than one additional property.
 * If the device/component has one or more properties, a function for just
 *     updating the inner object ought be called to insert the properties'
 *     objects into the rdfs list.
 * @parameters: String: ontology, String: type (both retrieved from the database)
 * @return: List: The rdfs list with the identification information (only one object pushed)
 */
function createRdfs(elementOntology, elementType) {
    const auxObjType = {}; /* Key: "@id"
                            * Value: ontology:type */
    const thisRdfsSubClassOf = [];
    auxObjType['@id'] = concatenate(elementOntology, ':', elementType);
    thisRdfsSubClassOf.push(auxObjType);
    return thisRdfsSubClassOf; /* This list will be the value for the key "rdfs:subClassOf" in
                                * the object identificationDevice  */
}

/* Function used for updating the rdfs list with one additional property element
 * This function is responsible for adding one element with the additional property
 * passed as parameter. Hence, this function is called for each time the flag
 * "is_add_property" is true.
 * The format of the pushed element (on the current rdfsSubClassOf) can be seen bellow:
 * {
 *   "@id" : "prefixCompany:id-additionalProperty"
 * }              
 * @parameters: List: current rdfs list, Object: childSnapshot (for prefixCompany and Id), String: id of the additional property
 * @return: List: the rfds list with one object with a new property pushed into it
 */
function updateRdfsProperties(elementRdfsSubClassOf, elementChildSnapshot, elementIdProperty) {
    const auxObjPropId = {}; /* Key: "@id" for the additional property
                              * Value: prefixCompany:Id-id_property */
    auxObjPropId['@id'] = concatenate(elementChildSnapshot.prefixCompany, ':', elementChildSnapshot.id, '-', elementIdProperty);
    elementRdfsSubClassOf.push(auxObjPropId);
    return elementRdfsSubClassOf; // Updating the rdfs list with a additional property
}

/* Function to create the object of IoT Lite definitions
 * @parameters: Object: Iot Lite Context, List: Iot Lite Graph
 * @return: Object: definitions
 */
function createDefinitions(elementContext, elementGraph) {
    let this_definitions = {};
    this_definitions['@context'] = elementContext;
    this_definitions['@graph'] = elementGraph;
    return this_definitions; /* This object's gonna be stored on the browser's
                              *     local storage in each initialization of the
                              *     Platform
                              */
}

/* Function that gets the prefix from the place where the user is modelling the digital environenbt
 * @parameters: callback function: createContext() for iot-lite purposes
 * @return: void, the function stores the prefix in the local storage 
 *          if the context has already been defined
 */
function getPrefix(callback) {
firebase.database().ref('defaults/defaultcontext').orderByKey().once('value')
    .then((snapshot) => {
        const keyDefaultContext = snapshot.val(); // snapshot.val() contains the value (string) with the key of the default context
        firebase.database().ref(`contexts/${keyDefaultContext}`).orderByKey().once('value') // Accessing the object of the default context
        .then((snapshot) => { 
            let c;
            for (c in snapshot.val()) {
                if (c.split(':')[1] === PIN_CONF_PROP) {
                    localStorage.setItem('prefix', c.split(':')[0]);
                }
            }
        });
    });
    return callback();
}

/*****************************************************/
/***************** Auxiliar Functions ****************/
/*****************************************************/

/* Function used to verify if a property is default (e.g.: Id) or additional (e.g.: Number of Pins)
 * @parameters: String: property
 * @return: Boolean: true->the property isn't default, false->the property is a default one
 */
function verifyAdditionalProperty(elementProperty_i) {
    let this_is_additional_property = true; // It'll be false just if the property has be found in the default properties' list
    for (var prop = 0; prop < default_properties.length; prop++) {
        if (elementProperty_i.toUpperCase() == default_properties[prop].toUpperCase()) { // the property is a default one
            this_is_additional_property = false; // This means property_i is in the list of default properties
        }
        else {
            continue; // Don't set the variable up to one because all the list of default properties ought to be checked
        }
    }
    return this_is_additional_property;
}

/* Function used to verify if a value is a Integer or not
 * @parameters: Data type
 * @return: Boolean: true->if the data is a non-negative-integer, false->another type of data
 */
function isNonNegativeInteger(elementValue) {
    return (typeof elementValue === 'number' && elementValue % 1 === 0 && elementValue > 0);
}

function logInit() {
    console.log('Log:\n1.The prefix has been set.');
    console.log('2.The IoT Lite @Context has been created.');
    console.log('3.The IoT Lite @Context has been created.');
}

/*****************************************************/
/*********** Local Storage's manipulation ************/
/*****************************************************/

/* Function to manipulate keyStored->@graph on the 
 * local storage. This function is responsible for: 
 * - retrieving the object definitions in a string format
 * - conversion of the string into an object 
 * - updating of the object with the element for @graph
 *   (element of identification or additional property)
 * - store of the updated object in a string format on
 *   the local storage with the same key passed as parameter
 * @parameters: String: key where the current object is stored, 
 *              Object: element of identification or additional property
 * @return: void, the function just updates the local storage
 */
function manageGraphLocalStorage(keyAccess, keyStore, elementGraph) {
    const currentDefinitions = localStorage.getItem(keyAccess); // type: string
    const objCurrentDefinitions = JSON.parse(currentDefinitions); // string -> object
    /* The elements shall be pushed one by one into the @graph list */
    for (let i=0; i<elementGraph.length; i++) {
        objCurrentDefinitions['@graph'].push(elementGraph[i]); // Updating the @graph list inner the object of definitions
    }
    localStorage.setItem(keyStore, JSON.stringify(objCurrentDefinitions)); // Updating the object definitions with the  
}

/*****************************************************/
/************** Database's manipulation **************/
/*****************************************************/

/* Read the data from the database (key: images) and update them on the local storage
 */
const ref = firebase.database().ref('models');
firebase.database().ref("images").orderByKey().once("value")
.then((snapshot) => { 
    snapshot.forEach((childSnapshot) => {
        //console.log("Iicon Key: ", childSnapshot.key);
        ref.on("value", (snapshot) => {
            //console.log("The icon: ", snapshot.val());
            for (var keyDC in snapshot.val()) {
                //console.log("DevComp: ", snapshot.val()[keyDC]);
                if (snapshot.val()[keyDC].imageFile === childSnapshot.key) {
                    localStorage.setItem(snapshot.val()[keyDC].id, childSnapshot.val()); /* key: id of the device/component,
                                                                                          * value: value of the icon in base64 */
                }
            }
        });
    });
});


/* Reading data from the database (key: "models")
 */
firebase.database().ref('models').orderByKey().once('value')
.then((snapshot) => { // after function(snapshot), snapshot is the whole data structure
    let id_element = {}; // Element of identification 
    let rdfsSubClassOf = []; // Value for the key "rdfs:subClassOf" on the element of identification
    let is_add_property;
    let auxObjAddProperty = {}; // Auxiliar object for an additional property which will be pushed on thr @graph list as a new element
    let childSnapshotVal_owlRestriction = ''; // Default value (set by a dot) is "owl:Restriction"
    let auxObj_OwlOnProperty = {}; // Object value for the key "owl:onProperty" on the additional property element
    let auxObj_owlCardinality = {}; // Object value for the key "owl:cardinality" on the additional property element 

    var extensionsGraph = []; /* Contains all elements for extension of the @graph list on definitions.
                               * All the elements will be pushed one by one into the list, and after that,
                               * the whole object will be updated on the local storage */
    let additionalChangeableProp = {}; // id, owl type, domain, range
    let changeablePropRdfsDomain = {}; // ontology:type(device/component)
    let changeablePropRdfsRange = {}; // xsd:type_value 
    getPrefix(() => {
        createContext(() => {
            createGraph(() => {    
          });
        });
      });
    
    snapshot.forEach((childSnapshot) => {  // Loop into database's information
    //var key = childSnapshot.key;
        switch (childSnapshot.val().type) {
            case 'Device':
                id_element = {}; 
                rdfsSubClassOf = []; 
                id_element['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id); //prefix:id
                id_element['@type'] = 'owl:Class';
                /* Example of identification object with one additional property:
                 * { // Element of identification  
                 *   "@id": "ipvs:RaspberryPi",
                 *   "@type": "owl:Class",
                 *   "rdfs:subClassOf": [
                 *     {
                 *       "@id": "ssn:Device"
                 *     },
                 *     {
                 *       "@id" : "ipvs:RaspberryPi-numberOfPins"
                 *     }
                 *   ]
                 * },
                 * 
                 * { // Element of an additional property (numberOfPins)
                 *   "@id" : "ipvs:RaspberryPi-numberOfPins",
                 *   "@type": "owl:Restriction",
                 *   "rdfs:comment": "OWL restriction specifying the number of pins of a raspberry pi.",
                 *   "owl:onProperty": {
                 *     "@id": "ipvs:numberOfPins"
                 *   },
                 *   "owl:cardinality": {a
                 *     "@value": "1",
                 *     "@type": "xsd:nonNegativeInteger"
                 *   }
                 * },
                 */ 
                
                rdfsSubClassOf = createRdfs(childSnapshot.val().ontology, childSnapshot.val().type);
                /* Now, rdfsSubClassOf contains a list in this format:
                 * [
                 *     {
                 *       "@id": "ssn:Device"
                 *     }
                 * ]
                 * Which will be the value for the key "rdfs:subClassOf" on the element of identification
                 */
                
                /* Starting to get the additional properties of the device/
                 *     component with the key childSnapshot.key
                 */
                for (var property_i in childSnapshot.val()) {
                    if((childSnapshot.val()).hasOwnProperty(property_i)) { // This will check all properties' names on database's key
                        is_add_property = verifyAdditionalProperty(property_i);
                        if (is_add_property === true) {
                            if (childSnapshot.val()[property_i].NewPropertyOwlType === 'owl:Restriction') { // Just uncheageable properties go onto the devices' definitions and value for sensors
                                rdfsSubClassOf = updateRdfsProperties (rdfsSubClassOf, childSnapshot.val(), property_i); //rdfsSubClassOf: current list of elements
                                //console.log('rdfsSubClassOf: ', rdfsSubClassOf);
                            }
                            /* Now, rdfsSubClassOf is updated with the new additional property (its identification element) */
                            //console.log("Additional Property: ", property_i);

                            /* Example of a changeable property element:
                            {
                                "@id": "ipvs:macAddress",     // Define the MacAdress property as Attribute of RaspberryPi
                                "@type": "owl:DatatypeProperty",
                                "rdfs:domain": {
                                    "@id": "ssn:Device"
                                },
                                "rdfs:range": {
                                    "@id": "xsd:string"
                                }
                            },
                            */
                            if(childSnapshot.val()[property_i].NewPropertyOwlType === 'owl:DatatypeProperty') { // Changeable property
                                //console.log("It's changeable: ", property_i);
                                additionalChangeableProp = {}; // id, owl type, domain, range
                                changeablePropRdfsDomain = {}; // ontology:type(device/component)
                                changeablePropRdfsRange = {};
                                
                                additionalChangeableProp['@id'] =  concatenate(childSnapshot.val().prefixCompany, ':', property_i);
                                additionalChangeableProp['@type'] = childSnapshot.val()[property_i].NewPropertyOwlType;
                                
                                changeablePropRdfsDomain['@id'] = concatenate(childSnapshot.val().ontology, ':', childSnapshot.val().type);
                                changeablePropRdfsRange['@id'] = childSnapshot.val()[property_i].NewPropertyType;
                                additionalChangeableProp['rdfs:domain'] = changeablePropRdfsDomain;
                                additionalChangeableProp['rdfs:range'] = changeablePropRdfsRange;
                                //console.log('Complet object additional changeable prop: ', additionalChangeableProp);
                                extensionsGraph.push(additionalChangeableProp); // Updating the @graph with an additional property
                            }                                                                                    
                        
                            else { // Unchangeable property: owl:Restriction
                                //console.log("It's not changeable");
                                id_element['rdfs:subClassOf'] = rdfsSubClassOf; // Updating the id element with the rdfs list
                                auxObjAddProperty = {};
                                childSnapshotVal_owlRestriction = '';
                                auxObj_OwlOnProperty = {};
                                auxObj_owlCardinality = {};
    
                                // If the ownRestriction is empty is because the user has prefered the default option for this IoT Lite information
                                childSnapshot.val().owlRestriction === '.' ? childSnapshotVal_owlRestriction='owl:Restriction' : childSnapshotVal_owlRestriction=childSnapshot.val().owlRestriction;
                                
                                auxObjAddProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id, '-', property_i); // "prefixCompany:id-additionalProperty"
                                auxObjAddProperty['@type'] = "owl:Restriction";
                                auxObjAddProperty['rdfs:comment'] = "childSnapshot.val().rdfsComment";
                                
                                auxObj_OwlOnProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', property_i);
                                
                                /* Getting the data for the key "owl:cardinality" on the element of the additional property */
                                auxObj_owlCardinality['@value'] = childSnapshot.val()[property_i].NewPropertyValue;
                                isNonNegativeInteger(childSnapshot.val()[property_i.toString()])? auxObj_owlCardinality['@type'] = 'xsd:nonNegativeInteger' : auxObj_owlCardinality['@type'] = 'xsd:string';
    
                                /* Updating the objects for the additional property's element */
                                auxObjAddProperty['owl:onProperty'] = auxObj_OwlOnProperty; // Updating the element of the additional property
                                auxObjAddProperty['owl:cardinality'] = auxObj_owlCardinality; // Updating the element of the additional property
                            
                                extensionsGraph.push(auxObjAddProperty); // Updating the @graph with an additional property  
                            }
                            
                            //console.log('The ID element (update): ', id_element); // tested: ok for binding
                            //console.log('Element info additional property: ', auxObjAddProperty); // tested: ok for binding                             
                        } // is_add_property==true
                    } // it's a property key
                } // for each property
                /* On this part, every property of the device in case has been checked,
                 * so the element of identification can be pushed into @graph, whereas
                 * definitions will be update with the new @graph 
                 */
                
                 extensionsGraph.push(id_element); // Updating the @graph with an additional property
                break;

            case 'SensingDevice':
                id_element = {};
                rdfsSubClassOf = [];       
                id_element['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id);
                id_element['@type'] = 'owl:Class';
                rdfsSubClassOf = createRdfs (childSnapshot.val().ontology, childSnapshot.val().type);
                for (var property_i in childSnapshot.val()) {
                    if((childSnapshot.val()).hasOwnProperty(property_i)) {
                        is_add_property = verifyAdditionalProperty(property_i);
                        if (is_add_property == true) {
                            if (childSnapshot.val()[property_i].NewPropertyOwlType === 'owl:Restriction' || property_i === 'value') { // Just uncheageable properties go onto the devices' definitions
                                //console.log('proper: ', property_i);
                                rdfsSubClassOf = updateRdfsProperties (rdfsSubClassOf, childSnapshot.val(), property_i) //rdfsSubClassOf: current list of elements
                                //console.log('rdfsSubClassOf: ', rdfsSubClassOf);
                            }
                            //console.log("Additional Property: ", property_i);
                            if(childSnapshot.val()[property_i].NewPropertyOwlType === 'owl:DatatypeProperty') { // Changeable property
                                //console.log("It's changeable: ", property_i);
                                additionalChangeableProp = {}; // id, owl type, domain, range
                                changeablePropRdfsDomain = {}; // ontology:type(device/component)
                                changeablePropRdfsRange = {};

                                additionalChangeableProp['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', property_i);
                                additionalChangeableProp['@type'] = childSnapshot.val()[property_i].NewPropertyOwlType;
                                
                                changeablePropRdfsDomain['@id'] = concatenate(childSnapshot.val().ontology, ':', childSnapshot.val().type);
                                changeablePropRdfsRange['@id'] = childSnapshot.val()[property_i].NewPropertyType;
                                additionalChangeableProp['rdfs:domain'] = changeablePropRdfsDomain;
                                additionalChangeableProp['rdfs:range'] = changeablePropRdfsRange;
                                //console.log('Complet object additional changeable prop: ', additionalChangeableProp);
                                extensionsGraph.push(additionalChangeableProp); // Updating the @graph with an additional property
                            }                                                                                    
                            
                            else { // Unchangeable property: owl:Restriction
                                //console.log("It's not changeable");
                                id_element['rdfs:subClassOf'] = rdfsSubClassOf; // Updating the id element with the rdfs list
                                auxObjAddProperty = {};
                                childSnapshotVal_owlRestriction = '';
                                auxObj_OwlOnProperty = {};
                                auxObj_owlCardinality = {};
                                // If the ownRestriction is empty is because the user has prefered the default option for this IoT Lite information
                                childSnapshot.val().owlRestriction === '.' ? childSnapshotVal_owlRestriction='owl:Restriction' : childSnapshotVal_owlRestriction=childSnapshot.val().owlRestriction;
                                auxObjAddProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id, '-', property_i); // "prefixCompany:id-additionalProperty"
                                auxObjAddProperty['@type'] = "owl:Restriction";
                                auxObjAddProperty['rdfs:comment'] = childSnapshot.val().rdfsComment;
                                auxObj_OwlOnProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', property_i);                              
                                /* Getting the data for the key "owl:cardinality" on the element of the additional property */
                                auxObj_owlCardinality['@value'] = childSnapshot.val()[property_i].NewPropertyValue;
                                isNonNegativeInteger(childSnapshot.val()[property_i.toString()])? auxObj_owlCardinality['@type'] = 'xsd:nonNegativeInteger' : auxObj_owlCardinality['@type'] = 'xsd:string';
                                /* Updating the objects for the additional property's element */
                                auxObjAddProperty['owl:onProperty'] = auxObj_OwlOnProperty; // Updating the element of the additional property
                                auxObjAddProperty['owl:cardinality'] = auxObj_owlCardinality; // Updating the element of the additional property
                                extensionsGraph.push(auxObjAddProperty); // Updating the @graph with an additional property  
                            }
                        }
                    } 
                } 
                extensionsGraph.push(id_element); // Updating the @graph with an additional property
                break;
            case 'ActuatingDevice':
                id_element = {};
                rdfsSubClassOf = []; 
                id_element['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id);
                id_element['@type'] = 'owl:Class';
                rdfsSubClassOf = createRdfs (childSnapshot.val().ontology, childSnapshot.val().type);
                for (var property_i in childSnapshot.val()) {
                    if((childSnapshot.val()).hasOwnProperty(property_i)) {
                        is_add_property = verifyAdditionalProperty(property_i);
                        if (is_add_property == true) {
                            if (childSnapshot.val()[property_i].NewPropertyOwlType === 'owl:Restriction') { // Just uncheageable properties go onto the devices' definitions
                                rdfsSubClassOf = updateRdfsProperties (rdfsSubClassOf, childSnapshot.val(), property_i) //rdfsSubClassOf: current list of elements
                            }
                            //console.log("Additional Property: ", property_i);
                            if(childSnapshot.val()[property_i].NewPropertyOwlType === 'owl:DatatypeProperty') { // Changeable property
                                //console.log("It's changeable: ", property_i);
                                additionalChangeableProp = {}; // id, owl type, domain, range
                                changeablePropRdfsDomain = {}; // ontology:type(device/component)
                                changeablePropRdfsRange = {};
                                
                                additionalChangeableProp['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', property_i);
                                additionalChangeableProp['@type'] = childSnapshot.val()[property_i].NewPropertyOwlType;

                                changeablePropRdfsDomain['@id'] = concatenate(childSnapshot.val().ontology, ':', childSnapshot.val().type);
                                changeablePropRdfsRange['@id'] = childSnapshot.val()[property_i].NewPropertyType;
                                additionalChangeableProp['rdfs:domain'] = changeablePropRdfsDomain;
                                additionalChangeableProp['rdfs:range'] = changeablePropRdfsRange;
                                //console.log('Complet object additional changeable prop: ', additionalChangeableProp);

                                extensionsGraph.push(additionalChangeableProp); // Updating the @graph with an additional property
                            }                                                                                    
                        
                            else { // Unchangeable property: owl:Restriction
                                //console.log("It's not changeable");
                                id_element['rdfs:subClassOf'] = rdfsSubClassOf; // Updating the id element with the rdfs list
                                auxObjAddProperty = {};
                                childSnapshotVal_owlRestriction = '';
                                auxObj_OwlOnProperty = {};
                                auxObj_owlCardinality = {};
                                // If the ownRestriction is empty is because the user has prefered the default option for this IoT Lite information
                                childSnapshot.val().owlRestriction === '.' ? childSnapshotVal_owlRestriction='owl:Restriction' : childSnapshotVal_owlRestriction=childSnapshot.val().owlRestriction;

                                auxObjAddProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id, '-', property_i); // "prefixCompany:id-additionalProperty"
                                auxObjAddProperty['@type'] = "owl:Restriction";
                                auxObjAddProperty['rdfs:comment'] = childSnapshot.val().rdfsComment;
                                
                                auxObj_OwlOnProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', property_i);                              
                                /* Getting the data for the key "owl:cardinality" on the element of the additional property */
                                auxObj_owlCardinality['@value'] = childSnapshot.val()[property_i].NewPropertyValue;
                                isNonNegativeInteger(childSnapshot.val()[property_i.toString()])? auxObj_owlCardinality['@type'] = 'xsd:nonNegativeInteger' : auxObj_owlCardinality['@type'] = 'xsd:string';
                                /* Updating the objects for the additional property's element */
                                auxObjAddProperty['owl:onProperty'] = auxObj_OwlOnProperty; // Updating the element of the additional property
                                auxObjAddProperty['owl:cardinality'] = auxObj_owlCardinality; // Updating the element of the additional property
                                extensionsGraph.push(auxObjAddProperty); // Updating the @graph with an additional property  
                            }
                        }
                    } 
                } 
                extensionsGraph.push(id_element); // Updating the @graph with an additional property
                break;
            default:
            id_element = {};
            rdfsSubClassOf = []; 
            id_element['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id);
            id_element['@type'] = 'owl:Class';
            rdfsSubClassOf = createRdfs (childSnapshot.val().ontology, childSnapshot.val().type);
            for (var property_i in childSnapshot.val()) {
                if((childSnapshot.val()).hasOwnProperty(property_i)) {
                    is_add_property = verifyAdditionalProperty(property_i);
                    if (is_add_property == true) {
                        if (childSnapshot.val()[property_i].NewPropertyOwlType === 'owl:Restriction') { // Just uncheageable properties go onto the devices' definitions
                            rdfsSubClassOf = updateRdfsProperties (rdfsSubClassOf, childSnapshot.val(), property_i) //rdfsSubClassOf: current list of elements
                        }
                        //console.log("Additional Property: ", property_i);
                        if(childSnapshot.val()[property_i].NewPropertyOwlType === 'owl:DatatypeProperty') { // Changeable property
                            //console.log("It's changeable: ", property_i);
                            additionalChangeableProp = {}; // id, owl type, domain, range
                            changeablePropRdfsDomain = {}; // ontology:type(device/component)
                            changeablePropRdfsRange = {};

                            additionalChangeableProp['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', property_i);
                            additionalChangeableProp['@type'] = childSnapshot.val()[property_i].NewPropertyOwlType;
                            
                            changeablePropRdfsDomain['@id'] = concatenate(childSnapshot.val().ontology, ':', childSnapshot.val().type);
                            changeablePropRdfsRange['@id'] = childSnapshot.val()[property_i].NewPropertyType;
                            additionalChangeableProp['rdfs:domain'] = changeablePropRdfsDomain;
                            additionalChangeableProp['rdfs:range'] = changeablePropRdfsRange;
                            //console.log('Complet object additional changeable prop: ', additionalChangeableProp);
                            extensionsGraph.push(additionalChangeableProp); // Updating the @graph with an additional property
                        }                                                                                    
                    
                        else { // Unchangeable property: owl:Restriction
                            //console.log("It's not changeable");
                            id_element['rdfs:subClassOf'] = rdfsSubClassOf; // Updating the id element with the rdfs list
                            auxObjAddProperty = {};
                            childSnapshotVal_owlRestriction = '';
                            auxObj_OwlOnProperty = {};
                            auxObj_owlCardinality = {};
                            // If the ownRestriction is empty is because the user has prefered the default option for this IoT Lite information
                            childSnapshot.val().owlRestriction === '.' ? childSnapshotVal_owlRestriction='owl:Restriction' : childSnapshotVal_owlRestriction=childSnapshot.val().owlRestriction;
                            auxObjAddProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id, '-', property_i); // "prefixCompany:id-additionalProperty"
                            auxObjAddProperty['@type'] = "owl:Restriction";
                            auxObjAddProperty['rdfs:comment'] = childSnapshot.val().rdfsComment; 
                            auxObj_OwlOnProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', property_i);                              
                            /* Getting the data for the key "owl:cardinality" on the element of the additional property */
                            auxObj_owlCardinality['@value'] = childSnapshot.val()[property_i].NewPropertyValue;
                            isNonNegativeInteger(childSnapshot.val()[property_i.toString()])? auxObj_owlCardinality['@type'] = 'xsd:nonNegativeInteger' : auxObj_owlCardinality['@type'] = 'xsd:string';
                            /* Updating the objects for the additional property's element */
                            auxObjAddProperty['owl:onProperty'] = auxObj_OwlOnProperty; // Updating the element of the additional property
                            auxObjAddProperty['owl:cardinality'] = auxObj_owlCardinality; // Updating the element of the additional property
                            extensionsGraph.push(auxObjAddProperty); // Updating the @graph with an additional property  
                        }
                    }
                } 
            } 
            extensionsGraph.push(id_element); // Updating the @graph with an additional property
        }
    });
    manageGraphLocalStorage('definitions', 'upDefinitions', extensionsGraph); // Extension graph is already done to be stored, with all components, devices and additional properties
});

dashboard.controller('myaccountController', ['$rootScope', '$scope', '$state', '$location', 'dashboardService', 'Flash', '$firebaseArray','$firebaseAuth','$firebaseObject',
function ($rootScope, $scope, $state, $location, dashboardService, Flash, $firebaseArray, $firebaseAuth, $firebaseObject) {
    var vm = this;
    var ref = firebase.database().ref('defaults/defaultcontext'); // Accesing the object context selected by the user
    var refg = firebase.database().ref('defaults/defaultgraph');
    var contextDefaultObj = $firebaseObject(ref); // Accessing the default @context key
    var refContexts = firebase.database().ref('contexts/'); // Accesing the object context selected by the user
    var allContexts = $firebaseObject(refContexts);
    var refGraphs = firebase.database().ref('graphs/'); // Accessing the object @graphs from Firebase
    var allGraphs = $firebaseObject(refGraphs);
    var graphDefaultObj = $firebaseObject(refg); // Acessing the default @graph key


    setTimeout(() => { // It works as a promise without using any function as parameter
            let current_key = contextDefaultObj.$value.toString();
            $scope.currentDefaultContext = allContexts[current_key.toString()].idcontext.toString();
        }, 2000);

    setTimeout(() => { // setTimeout(function() { 
            let current_key_graph = graphDefaultObj.$value.toString();
            $scope.currentDefaultGraph = allGraphs[current_key_graph.toString()].idgraph.toString();
        }, 2000);
    

    $scope.showAccountinfo = function (user) {
        $scope.show = true;
        $scope.Username = user.Username;
        $scope.Email = user.Email;
        $scope.addr = user.addr;
        $scope.id = user.$id;
    }

    /* Function to verify if a @Context has been set for the modelling environment */
    $scope.verifySettingDefaultContext = function () {
        if (!contextDefaultObj.$value.toString()) { // Default @context isn't set
            $scope.defaultContextIsSet = false;
        }
        else {
            $scope.defaultContextIsSet = true;
        }
    }

    $scope.verifySettingDefaultGraph = function () {
        if (!graphDefaultObj.$value.toString()) { // Default @graph isn't set
            $scope.defaultGraphIsSet = false;
        }
        else {
            $scope.defaultGraphIsSet = true;
        }
    }
    
    $scope.updateAdminInfoDB = function (userId, isAdmin) {
        var refUser = firebase.database().ref('users/' + userId); 
        let auxUserAdmin = {}; // isAdmin: Boolean
        auxUserAdmin.isAdmin = isAdmin;
        refUser.update(auxUserAdmin);
    }

    $scope.editFormSubmit = function () {
        var user = firebase.auth().currentUser;
        var ref = firebase.database().ref('users/'+$scope.id);
        var userDB = $firebaseObject(ref);

        userDB.$loaded().then(() => {
            userDB.Username = $scope.Username;
            userDB.addr = $scope.addr;
            userDB.Email = $scope.Email;
            userDB.$save().then((ref) => {
            },
            (error) => {
                console.log('Error:', error);
            });
        });
        user.updateEmail($scope.Email);
    }

    $('#form_id').submit(() => {
        $('#editModal').modal('hide');
    });

}]);