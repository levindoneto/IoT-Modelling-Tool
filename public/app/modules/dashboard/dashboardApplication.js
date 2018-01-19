const UNDEFINED = 'undefined';
const DEFINITIONS_KEY = 'definitions';
const PIN_CONF_PROP = 'pinConfiguration';
const UNCHANGEABLE_PROP = 'owl:Restriction';
const CHANGEABLE_PROP = 'owl:DatatypeProperty';
const UPDATED_DEFINITIONS_KEY = 'upDefinitions';
const defaultProperties = [
    'id',
    'imageFile',
    'ontology',
    'owlRestriction',
    'prefixCompany',
    'rdfsComment',
    'type',
    'userUid'];

var definitions = {}; // Global variable

/* Function for concatenating strings, even when some of them are empty or undefined
   @Parameters: Unlimited amount of strings
   @Return: String with the concatenation in the following format: str_0+str_1+...str_n */
function concatenate(...theArgs) {
    let concatenatedStr = '';
    let s;
    for (s = 0; s < theArgs.length; s++) {
        try { // It just does not work with empty or undefined strings
            concatenatedStr = concatenatedStr.concat((theArgs[s]).toString());
        } catch (err) {
            console.log('At least of the used arguments is undefined or has not been processed yet, which is generating the following processing error:\n', err);
            concatenatedStr = concatenatedStr.concat('');
            console.log('The error has been handled successfully, though');
            console.log('All the arguments from this call:\n', theArgs);
        }
    }
    return concatenatedStr;
}

/* Function to emulate the for i in range with AngularJS 
 * for (min, max, step) {
 *     do something;
 * } 
 */
function range(min, max, step) {
    step = step || 1;
    const input = [];
    let i;
    for (i = min; i <= max; i += step) {
        input.push(i);
    }
    return input;
}

/* Function used to verify if a property is default (e.g.: Id) or additional (e.g.: Number of Pins)
 * @parameters: String: property
 * @return: Boolean: true->the property isn't default, false->the property is a default one */
function verifyAdditionalProperty(elementPropertyI) {
    let thisIsAdditionalProperty = true;
    let prop;
    for (prop = 0; prop < defaultProperties.length; prop++) {
        if (elementPropertyI.toUpperCase() === defaultProperties[prop].toUpperCase()) { 
            thisIsAdditionalProperty = false; // This means elementPropertyI is set as default
        }
    }
    return thisIsAdditionalProperty;
}

/* Function used to verify if a value is a Integer or not
 * @parameters: Data type
 * @return: Boolean: true->if the data is a non-negative-integer, false->another type of data */
function isNonNegativeInteger(elementValue) {
    return (typeof elementValue === 'number' && elementValue % 1 === 0 && elementValue > 0);
}

/* Function that, given an object, creates a json file with it
   @Parameters: object: Bbject for conversion, id: string with the name without the date/time info 
   @Return: None, it opens a file for download in a JSON format */
function downloadFileJson(object, id, typeElement) {
    try {
        const hyperlinkTag = 'a';
        const d = new Date();
        const h = d.getHours() < 10 ? concatenate('0', d.getHours()) : d.getHours();
        const m = d.getMinutes() < 10 ? concatenate('0', d.getMinutes()) : d.getMinutes();
        const s = d.getSeconds() < 10 ? concatenate('0', d.getSeconds()) : d.getSeconds();
        const fileName = concatenate(id, '_', d.toISOString().substring(0, 10), '_', h, '-', m, '-', s);
        const pom = document.createElement(hyperlinkTag);
        pom.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(object, null, 2))}`);
        pom.setAttribute('download', concatenate(fileName, '.json')); 
        if (document.createEvent) {
            const downloadFile = document.createEvent('MouseEvents');
            downloadFile.initEvent('click', true, true); // Event may bubble up through the DOM: true,
                                                         //  Event may be canceled: true 
            pom.dispatchEvent(downloadFile);
        } else {
            pom.click();
        }
    } catch (err) {
        console.log('An error has occurred in the process of creation of the file for the selected ', typeElement);
        console.log('The detail of the error may be seen below\n', err.toString());
        swal({
            title: concatenate('An error has occurred in the process of creation of the file for the selected ', typeElement),
            icon: 'warning',
            button: false,
            timer: 3000
        });
    }
}
/* Function that resets information from the saved models */
function resetInfoSavedModels() {
    const refInfo = firebase.database().ref('infoSavedModels');
    const auxInfoSaved = {};
    auxInfoSaved.lastLoadedModel = UNDEFINED;
    auxInfoSaved.lastSavedModel = UNDEFINED;
    refInfo.update(auxInfoSaved); // Update the object on the database
}

/* Function which synchronizes the whole platform at the initialization */
function routeSyncInit() {
    if (localStorage.getItem('init') === 'false') {
        localStorage.setItem('init', 'true');
        window.location.reload();
    }
}

/* Function which synchronizes the whole platform */
function routeSync() {
    if (window.localStorage) {
        if (!localStorage.getItem('firstLoad')) {
            localStorage.firstLoad = true;
            window.location.reload();
        } else {
            localStorage.removeItem('firstLoad');
        }
    }
}

/* Function that creates the object context based on the one set by the user as default
 * @parameters: callback function: createGraph() for iot-lite purposes
 * @return: Creation of the object definitions with the the object definitions' 
 * updating  with an object */
function createContext(callback) {
    // Getting the default @context key (defaults->defaultcontext)
    firebase.database().ref('defaults/defaultcontext').orderByKey().once('value')
    .then((snapshot) => {
        const keyDefaultContext = snapshot.val();
        firebase.database().ref(`contexts/${keyDefaultContext}`).orderByKey().once('value')
        .then((snapshot) => {
            /* The whole context object is built based on the default @context 
             * set by the user is being set on the global definitions object */
            window.definitions['@context'] = snapshot.val();
            /* Initialize definitions with the @context, this is a variable of the type string,
             * which needs to be converted to object afterwards */
            localStorage.setItem(DEFINITIONS_KEY, JSON.stringify(window.definitions));
            /* The object has to be built and armazened on the local storage during the execution,
             * otherwise undefined variables are obtained because of the asynchronous execution */
        });
    });
    return callback(); // createGraph() is executed right after createContext() has been finished
}

/* Function which creates/updates the list of the iot lite graph element
 * @parameters: void, all the parameters are obtained from the database in real-time
 * @return: Updating of the object definitions with a list of object elements
 * This function ought to be called after createContext(), since this one creates
 * the object definitions, which should be update by the @graph list (generated
 * by createGraph()) */
function createGraph() {
    firebase.database().ref('defaults/defaultgraph').orderByKey().once('value')
    .then((snapshot) => {
        const keyDefaultGraph = snapshot.val();
        firebase.database().ref(`graphs/${keyDefaultGraph}`).orderByKey().once('value')
        .then((snapshot) => {
            // List with the default elements (object->list)
            const listDefaultElements = Object.values(JSON.parse(snapshot.val().defaultobjectsgraph)['@graph']);
            // Retrieve the current definitions from the local storage
            const currentDefinitions = localStorage.getItem(DEFINITIONS_KEY);
            const objCurrentDefinitions = JSON.parse(currentDefinitions);
            // Update the object definitions with the @graph elements
            objCurrentDefinitions['@graph'] = listDefaultElements;
            // Update the local storage with the new definitions object
            localStorage.setItem(DEFINITIONS_KEY, JSON.stringify(objCurrentDefinitions)); 
        });
    });
    logInit();
}

/* Function that generates the iot lite list RDFS.
 * this list contains at least one object:
 * -> One with the information about the ontology and the type of the device or component.
 * Also, it might have more objects. The amount of other objects depends on
 * the number of additional properties that the device/component has.
 * This function is called for each device/component, and the device might have
 * more than one additional property.
 * If the device/component has one or more properties, a function for just
 * updating the inner object is called to insert the properties'
 * objects into the RDFS list.
 * @parameters: String: ontology, String: type (both retrieved from the database)
 * @return: List: The RDFS list with the identification information (only one object pushed) */
function createRdfs(elementOntology, elementType) {
    const auxObjType = {}; /* Key: "@id"
                            * Value: ontology:type */
    const thisRdfsSubClassOf = [];
    auxObjType['@id'] = concatenate(elementOntology, ':', elementType);
    thisRdfsSubClassOf.push(auxObjType);
    return thisRdfsSubClassOf; /* This list will be the value for the key "rdfs:subClassOf" in
                                * the object identificationDevice  */
}

/* Function which updates the RDFS list with one additional property element
 * This function is responsible for adding one element with the additional property
 * passed as parameter. Hence, this function is called for each time the flag
 * "isAddProperty" is true.
 * The format of the pushed element (on the current rdfsSubClassOf) can be seen bellow:
 * {
 *   "@id" : "prefixCompany:id-additionalProperty"
 * }              
 * @parameters: List: current RDFS list, Object: childSnapshot (for prefixCompany and Id),
 *              String: id of the additional property
 * @return: List: the rfds list with one object with a new property pushed into it */
function updateRdfsProperties(elementRdfsSubClassOf, elementChildSnapshot, elementIdProperty) {
    const auxObjPropId = {}; /* Key: "@id" for the additional property
                              * Value: prefixCompany:Id-id_property */
    auxObjPropId['@id'] = concatenate(elementChildSnapshot.prefixCompany, ':', elementChildSnapshot.id, '-', elementIdProperty);
    elementRdfsSubClassOf.push(auxObjPropId);
    return elementRdfsSubClassOf; // Updating the RDFS list with a additional property
}

/* Function that gets the prefix from the place where the user is modelling the digital environment
 * @parameters: callback function: createContext() for iot-lite purposes
 * @return: void, the function stores the prefix in the local storage 
 *          if the context has already been defined */
function getPrefix(callback) {
firebase.database().ref('defaults/defaultcontext').orderByKey().once('value')
    .then((snapshot) => {
        const keyDefaultContext = snapshot.val();
        firebase.database().ref(`contexts/${keyDefaultContext}`).orderByKey().once('value')
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

function logInit() {
    console.log('Log:\n1.The prefix has been set.');
    console.log('2.The IoT Lite @Context has been created.');
    console.log('3.The IoT Lite @Context has been created.');
}

/* Function which manipulates the keyStored->@graph on the 
 * local storage. This function is responsible for: 
 * - retrieving the object definitions in a string format
 * - conversion of the string into an object 
 * - updating of the object with the element for @graph
 *   (element of identification or additional property)
 * - storing the updated object in a string format on
 *   the local storage with the same key passed as parameter
 * @parameters: String: key where the current object is stored, 
 *              Object: element of identification or additional property.
 * @return: void, the function just updates the local storage.
 */
function manageGraphLocalStorage(keyAccess, keyStore, elementGraph) {
    let hasManaged;
    const currentDefinitions = localStorage.getItem(keyAccess);
    const objCurrentDefinitions = JSON.parse(currentDefinitions); // String -> Object
    let i;
    // The elements shall be pushed one by one into the @graph list
    if (objCurrentDefinitions) {
        for (i = 0; i < elementGraph.length; i++) {
            // Update the @graph list inner the object of definitions
            objCurrentDefinitions['@graph'].push(elementGraph[i]);
        }
        hasManaged = true;
    }
    if (!hasManaged) {
        console.log('A problem for generating the IoT Lite elements has been found.');
        console.log('Cause: Slow internet connection.');
        console.log('A new attempt is being done right now.');
        setTimeout(() => {
            for (i = 0; i < elementGraph.length; i++) {
                objCurrentDefinitions['@graph'].push(elementGraph[i]);
            }
            localStorage.setItem(keyStore, JSON.stringify(objCurrentDefinitions));
            hasManaged = true;
        }, 1000);
        setTimeout(() => {
            routeSync();
        }, 1250);
    }
    localStorage.setItem(keyStore, JSON.stringify(objCurrentDefinitions));
}

/* Function which updates the graph element with the additional objects
 * regarding the new devices, components and properties that are added
 * during the execution of the application. 
 * @parameters: Object: extensionsGraph
 *              String keys: definitionsElement, upDefinitions 
 *              Function: manageGraphLocalStorage(...)
 * @return: Callback function: manageGraphLocalStorage(...) */
function updateGraphElement(extensionsGraph, definitionsElement, upDefinitions, callback) {
    const refDefaults = firebase.database().ref('defaults/');
    const auxUpdatedGraph = {};
    const auxExtensionGraph = [];
    refDefaults.once('value', (snapDefaults) => {
        const refAdditional = firebase.database().ref(`graphs/${snapDefaults.val().defaultgraph}`);
        refAdditional.once('value', (snapAdd) => {
            let i;
            for (i = 0; i < Object.keys(extensionsGraph).length; i++) {
                auxExtensionGraph.push(extensionsGraph[i]);
            }
            auxUpdatedGraph.defaultobjectsgraph = snapAdd.val().defaultobjectsgraph;
            auxUpdatedGraph.extensionGraph = JSON.stringify(auxExtensionGraph);
            refAdditional.update(auxUpdatedGraph);
        });
    });
    return callback(definitionsElement, upDefinitions, extensionsGraph);
}

/* Read the data from the database (key: images) and update them on the local storage */
const ref = firebase.database().ref('models');
firebase.database().ref('images').orderByKey().once('value')
.then((snapshot) => { 
    snapshot.forEach((childSnapshot) => {
        ref.on('value', (snapshot) => {
            let keyDC;
            for (keyDC in snapshot.val()) {
                if (snapshot.val()[keyDC].imageFile === childSnapshot.key) {
                    /* key: id of the device/component, value: value of the icon in base64 */
                    localStorage.setItem(snapshot.val()[keyDC].id, childSnapshot.val());
                }
            }
        });
    });
});


/* Read the data from the database (key: "models") */
firebase.database().ref('models').orderByKey().once('value')
.then((snapshot) => { // After function(snapshot), snapshot is the whole data structure with devices and components
    let idElement = {}; // Element of identification 
    let rdfsSubClassOf = []; // Value for the key "RDFS:subClassOf" on the element of identification
    let isAddProperty;
    let auxObjAddProperty = {}; // Auxiliar object for an additional property which will be pushed on the @graph list as a new element
    let childSnapshotValOwlRestriction = ''; // Default value (set by a dot) is "owl:Restriction"
    let auxObjOwlOnProperty = {}; // Object value for the key "owl:onProperty" on the additional property element
    let auxObjOwlCardinality = {}; // Object value for the key "owl:cardinality" on the additional property element 
    var extensionsGraph = []; /* It contains all elements for extension of the @graph list on definitions.
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
    snapshot.forEach((childSnapshot) => {  // Loop through database's information
        switch (childSnapshot.val().type) {
            case 'Device':
                idElement = {}; 
                rdfsSubClassOf = []; 
                idElement['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id); //prefix:id
                idElement['@type'] = 'owl:Class';
                rdfsSubClassOf = createRdfs(childSnapshot.val().ontology, childSnapshot.val().type);
                for (var propertyI in childSnapshot.val()) {
                    if((childSnapshot.val()).hasOwnProperty(propertyI)) {
                        isAddProperty = verifyAdditionalProperty(propertyI);
                        if (isAddProperty === true) {
                            if (childSnapshot.val()[propertyI].NewPropertyOwlType === UNCHANGEABLE_PROP) {
                                rdfsSubClassOf = updateRdfsProperties (rdfsSubClassOf, childSnapshot.val(), propertyI);
                            }
                            if (childSnapshot.val()[propertyI].NewPropertyOwlType === CHANGEABLE_PROP) {
                                additionalChangeableProp = {}; // id, owl type, domain, range
                                changeablePropRdfsDomain = {}; // ontology:type(device/component)
                                changeablePropRdfsRange = {};
                                additionalChangeableProp['@id'] =  concatenate(childSnapshot.val().prefixCompany, ':', propertyI);
                                additionalChangeableProp['@type'] = childSnapshot.val()[propertyI].NewPropertyOwlType;
                                changeablePropRdfsDomain['@id'] = concatenate(childSnapshot.val().ontology, ':', childSnapshot.val().type);
                                changeablePropRdfsRange['@id'] = childSnapshot.val()[propertyI].NewPropertyType;
                                additionalChangeableProp['rdfs:domain'] = changeablePropRdfsDomain;
                                additionalChangeableProp['rdfs:range'] = changeablePropRdfsRange;
                                extensionsGraph.push(additionalChangeableProp);
                            } else {
                                idElement['rdfs:subClassOf'] = rdfsSubClassOf;
                                auxObjAddProperty = {};
                                childSnapshotValOwlRestriction = '';
                                auxObjOwlOnProperty = {};
                                auxObjOwlCardinality = {};
                                childSnapshot.val().owlRestriction === '.' ? childSnapshotValOwlRestriction=UNCHANGEABLE_PROP : childSnapshotValOwlRestriction=childSnapshot.val().owlRestriction;
                                auxObjAddProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id, '-', propertyI); // "prefixCompany:id-additionalProperty"
                                auxObjAddProperty['@type'] = UNCHANGEABLE_PROP;
                                auxObjAddProperty['rdfs:comment'] = 'childSnapshot.val().rdfsComment';
                                auxObjOwlOnProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', propertyI);
                                auxObjOwlCardinality['@value'] = childSnapshot.val()[propertyI].NewPropertyValue;
                                isNonNegativeInteger(childSnapshot.val()[propertyI.toString()]) ? auxObjOwlCardinality['@type'] = 'xsd:nonNegativeInteger' : auxObjOwlCardinality['@type'] = 'xsd:string';
                                auxObjAddProperty['owl:onProperty'] = auxObjOwlOnProperty;
                                auxObjAddProperty['owl:cardinality'] = auxObjOwlCardinality;
                                extensionsGraph.push(auxObjAddProperty); // Update the @graph with an additional property  
                            }                            
                        }
                    }
                }
                /* On this part, every property of the device in case has been checked,
                 * so the element of identification can be pushed into @graph, whereas
                 * definitions will be update with the new @graph */
                 extensionsGraph.push(idElement);
                break;

            case 'SensingDevice':
                idElement = {};
                rdfsSubClassOf = [];       
                idElement['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id);
                idElement['@type'] = 'owl:Class';
                rdfsSubClassOf = createRdfs (childSnapshot.val().ontology, childSnapshot.val().type);
                for (var propertyI in childSnapshot.val()) {
                    if((childSnapshot.val()).hasOwnProperty(propertyI)) {
                        isAddProperty = verifyAdditionalProperty(propertyI);
                        if (isAddProperty === true) {
                            if (childSnapshot.val()[propertyI].NewPropertyOwlType === UNCHANGEABLE_PROP || propertyI === 'value') {
                                rdfsSubClassOf = updateRdfsProperties (rdfsSubClassOf, childSnapshot.val(), propertyI);
                            }
                            if (childSnapshot.val()[propertyI].NewPropertyOwlType === CHANGEABLE_PROP) {
                                additionalChangeableProp = {};
                                changeablePropRdfsDomain = {};
                                changeablePropRdfsRange = {};
                                additionalChangeableProp['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', propertyI);
                                additionalChangeableProp['@type'] = childSnapshot.val()[propertyI].NewPropertyOwlType;
                                changeablePropRdfsDomain['@id'] = concatenate(childSnapshot.val().ontology, ':', childSnapshot.val().type);
                                changeablePropRdfsRange['@id'] = childSnapshot.val()[propertyI].NewPropertyType;
                                additionalChangeableProp['rdfs:domain'] = changeablePropRdfsDomain;
                                additionalChangeableProp['rdfs:range'] = changeablePropRdfsRange;
                                extensionsGraph.push(additionalChangeableProp);
                            }  else {
                                idElement['rdfs:subClassOf'] = rdfsSubClassOf;
                                auxObjAddProperty = {};
                                childSnapshotValOwlRestriction = '';
                                auxObjOwlOnProperty = {};
                                auxObjOwlCardinality = {};
                                childSnapshot.val().owlRestriction === '.' ? childSnapshotValOwlRestriction = UNCHANGEABLE_PROP : childSnapshotValOwlRestriction = childSnapshot.val().owlRestriction;
                                auxObjAddProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id, '-', propertyI);
                                auxObjAddProperty['@type'] = UNCHANGEABLE_PROP;
                                auxObjAddProperty['rdfs:comment'] = childSnapshot.val().rdfsComment;
                                auxObjOwlOnProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', propertyI);
                                auxObjOwlCardinality['@value'] = childSnapshot.val()[propertyI].NewPropertyValue;
                                isNonNegativeInteger(childSnapshot.val()[propertyI.toString()]) ? auxObjOwlCardinality['@type'] = 'xsd:nonNegativeInteger' : auxObjOwlCardinality['@type'] = 'xsd:string';
                                auxObjAddProperty['owl:onProperty'] = auxObjOwlOnProperty;
                                auxObjAddProperty['owl:cardinality'] = auxObjOwlCardinality;
                                extensionsGraph.push(auxObjAddProperty);  
                            }
                        }
                    } 
                } 
                extensionsGraph.push(idElement);
                break;
            case 'ActuatingDevice':
                idElement = {};
                rdfsSubClassOf = []; 
                idElement['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id);
                idElement['@type'] = 'owl:Class';
                rdfsSubClassOf = createRdfs (childSnapshot.val().ontology, childSnapshot.val().type);
                for (var propertyI in childSnapshot.val()) {
                    if((childSnapshot.val()).hasOwnProperty(propertyI)) {
                        isAddProperty = verifyAdditionalProperty(propertyI);
                        if (isAddProperty === true) {
                            if (childSnapshot.val()[propertyI].NewPropertyOwlType === UNCHANGEABLE_PROP) {
                                rdfsSubClassOf = updateRdfsProperties (rdfsSubClassOf, childSnapshot.val(), propertyI);
                            }
                            if (childSnapshot.val()[propertyI].NewPropertyOwlType === CHANGEABLE_PROP) {
                                additionalChangeableProp = {};
                                changeablePropRdfsDomain = {};
                                changeablePropRdfsRange = {};
                                additionalChangeableProp['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', propertyI);
                                additionalChangeableProp['@type'] = childSnapshot.val()[propertyI].NewPropertyOwlType;
                                changeablePropRdfsDomain['@id'] = concatenate(childSnapshot.val().ontology, ':', childSnapshot.val().type);
                                changeablePropRdfsRange['@id'] = childSnapshot.val()[propertyI].NewPropertyType;
                                additionalChangeableProp['rdfs:domain'] = changeablePropRdfsDomain;
                                additionalChangeableProp['rdfs:range'] = changeablePropRdfsRange;
                                extensionsGraph.push(additionalChangeableProp);
                            } else {
                                idElement['rdfs:subClassOf'] = rdfsSubClassOf;
                                auxObjAddProperty = {};
                                childSnapshotValOwlRestriction = '';
                                auxObjOwlOnProperty = {};
                                auxObjOwlCardinality = {};
                                childSnapshot.val().owlRestriction === '.' ? childSnapshotValOwlRestriction=UNCHANGEABLE_PROP : childSnapshotValOwlRestriction=childSnapshot.val().owlRestriction;
                                auxObjAddProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', childSnapshot.val().id, '-', propertyI);
                                auxObjAddProperty['@type'] = UNCHANGEABLE_PROP;
                                auxObjAddProperty['rdfs:comment'] = childSnapshot.val().rdfsComment;
                                auxObjOwlOnProperty['@id'] = concatenate(childSnapshot.val().prefixCompany, ':', propertyI);
                                auxObjOwlCardinality['@value'] = childSnapshot.val()[propertyI].NewPropertyValue;
                                isNonNegativeInteger(childSnapshot.val()[propertyI.toString()]) ? auxObjOwlCardinality['@type'] = 'xsd:nonNegativeInteger' : auxObjOwlCardinality['@type'] = 'xsd:string';
                                auxObjAddProperty['owl:onProperty'] = auxObjOwlOnProperty;
                                auxObjAddProperty['owl:cardinality'] = auxObjOwlCardinality;
                                extensionsGraph.push(auxObjAddProperty);  
                            }
                        }
                    } 
                } 
                extensionsGraph.push(idElement); // Updating the @graph with an additional property
                break;
            default:
                console.log('The type has not been defined');
        }
    });
    updateGraphElement(extensionsGraph, 
        DEFINITIONS_KEY, 
        UPDATED_DEFINITIONS_KEY, 
        manageGraphLocalStorage);
});

var dashboard = angular.module('dashboard', ['ui.router', 'ngAnimate', 'ngMaterial', 'firebase', 'react']);
dashboard.factory('notification', ($firebaseArray, $firebaseObject) => ({
        send: function(message, user) {
            const ref = firebase.database().ref(`users/${user}`);
            const userDB = $firebaseObject(ref);
            userDB.$loaded().then(() => {
                  userDB.haveNotification = true;
                  userDB.$save().then((ref) => {
                  }, (error) => {
                      console.log('Error:', error);
                  });
            });
        }
    }));

  dashboard.config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('app.myaccount', {
          url: '/myaccount',
          templateUrl: 'app/modules/dashboard/views/myaccount.html',
          controller: 'myaccountController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'My Account'
          }
      });

      $stateProvider.state('app.adddefaultcontext', {
          url: '/adddefaultcontext',
          templateUrl: 'app/modules/dashboard/views/adddefaultcontext.html',
          controller: 'adddefaultcontextController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Add Default @Context'
          }
      });

      $stateProvider.state('app.addspecificcontext', {
          url: '/addspecificcontext',
          templateUrl: 'app/modules/dashboard/views/addspecificcontext.html',
          controller: 'addspecificcontextController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Add Specific @Context'
          }
      });

      $stateProvider.state('app.adddefaultgraph', {
          url: '/adddefaultgraph',
          templateUrl: 'app/modules/dashboard/views/adddefaultgraph.html',
          controller: 'adddefaultgraphController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Add Default @Graph'
          }
      });

      $stateProvider.state('app.mycontext', {
          url: '/mycontext',
          templateUrl: 'app/modules/dashboard/views/mycontext.html',
          controller: 'mycontextController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'IoT Lite @Context'
          }
      });

      $stateProvider.state('app.mygraph', {
          url: '/mygraph',
          templateUrl: 'app/modules/dashboard/views/mygraph.html',
          controller: 'mygraphController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'IoT Lite @Graph'
          }
      });

      $stateProvider.state('app.addbelonging', {
          url: '/addbelonging',
          templateUrl: 'app/modules/dashboard/views/addbelonging.html',
          controller: 'addbelongingController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Add Device or Component'
          }
      });

      $stateProvider.state('app.mybelongings', {
          url: '/mydevices',
          templateUrl: 'app/modules/dashboard/views/mybelongings.html',
          controller: 'mybelongingsController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Devices and Components'
          }
      });

      $stateProvider.state('app.addadditionalproperties', {
          url: '/addadditionalproperties',
          templateUrl: 'app/modules/dashboard/views/addadditionalproperties.html',
          controller: 'addadditionalpropertiesController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Add Additional Properties on Devices/Components'
          }
      });

      $stateProvider.state('app.search', {
          url: '/search',
          templateUrl: 'app/modules/dashboard/views/search.html',
          controller: 'searchController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'Search'
          }
      });

      $stateProvider.state('app.digitalenvironment', {
          url: '/digitalenvironment',
          templateUrl: 'app/modules/dashboard/digital_environment/src/main/resources/templates/index.html',
          controller: 'searchController',
          controllerAs: 'vm',
          data: {
              pageTitle: 'IoT Modelling Environment'
          }
      });
 }]);
