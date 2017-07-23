/**** List of needed parameters ****/

-> var at_context = createUpdateContext (defaultContext, extraContext);
-> var at_graph = createGraph (defaultGraph);
-> obj_identification = new identificationDevice(identificationDevice, rdfsSubClassOf);
-> obj_properties = new propertiesDevice(propertiesDevice, objOwlOnProperty, objOwlOnCardinality);
-> createDefinitions(objContext, objGraph)


defaultContext: String Object ||OK|| // From My Context page
extraContext: String Object ||OK|| // From My Context page

defaultGraph: String Object // From My Graph page

identDevice: childSnapshot.val()
rdfsSubClassOfInfo: ||OK||
rdfsSubClassOf: return of createRdfs(rdfsSubClassOfInfo)

propertiesDevice: Object (String property[i], String owlRestriction, String rdfs_comment)
    property[i]: for inner the devices (checking for aditional propreties)  ||OK||
    owlRestriction: String from the database (childSnapshot.val().owlRestriction) ||OK||
    rdfs_comment: String from the database (childSnapshot.val().rdfs_comment) ||OK||
objOwlOnProperty: Object (String prefixCompany, String property[i])
    prefixCompany: ||OK||
    property[i]:  ||OK||
objOwlOnCardinality: Object (Type_property value, String Type_property)
    value: property[i].val()  ||OK||
    Type_property: if with typeof property[i] ||OK||

objContext: return from createUpdateContext ||OK||
objGraph: LIST graph ||OK|| // The iot lite default elements
