import ActionGrade from 'material-ui/svg-icons/action/grade';
import DeviceStore from "../stores/DeviceStore";
import * as DropActions from '../actions/DropActions';
import { List, ListItem } from 'material-ui/List';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import React from "react";
import Subheader from 'material-ui/Subheader';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import * as utils from '../utils/utils';
import fire from '../database/fire' // Database to be accessed for this part of the application
import reactfire from 'reactfire' // Binding between the database and reactjs

const layout = {
    width: 200
};

console.log("MYLIST.......");

export default class MyList extends React.Component {

    constructor(props) {
        super(props);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.state = {
            testString: "HELLO WORLD",
            messages: [], // to create some test messages in the database
            //users: [], // To access the users in the appspot
            numbers: [], // JUST AN ACCESS TEST -> migrate to reactfire...
            models: [], // Devices, sensors and actuators stored in the firebase
            infos: [], // NumberOfPins, id, imageFile, type, userUid, etc for each key
            devices: DeviceStore.getAllDevices(),
            left: 0,
            openSetProperty: false,
            selectValues: [],
            textValue: "",
            id: "",
            type: "",
            selectAttribute: "",
            selectedDevice: "",
            key: 0
        };
    }


    componentWillMount() {
        /* Create reference to messages in Firebase Database */
        let messagesRef = fire.database().ref('messages').orderByKey().limitToLast(100);
        let numbersRef = fire.database().ref('numbers'); // Reference of the number text (reading test from the database)
        let modelsRef = fire.database().ref('models');  //Reference to the objects (each one contains informations about a devices, a sensor or an actuator)
        var query = firebase.database().ref("models").orderByKey();
        query.once("value")
        .then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {  // Loop into database's information
                // key will be "-K..." the 1st time, "-K..." in the 2nd time and so on
                var key = childSnapshot.key;
                console.log("EACH KEY:::::");
                console.log(key);
                console.log(":::::EACH KEY");
                // childData will be the actual contents of the child (information about each device, sensor or actuator)
                var childData = childSnapshot.val();
                console.log("CHILD DATA::::::");
                console.log(childData.id);
                console.log("::::::CHILD DATA");
            });
        });

        console.log("READING NUMBERS FROM THE DB:::::::");
        numbersRef.on('child_added', snapshot => {
            /* Update React state when message is added at Firebase Database */
            let number = { text: snapshot.val(), id: snapshot.key };
            this.setState({
                numbers: [number].concat(this.state.numbers)
            });
        })
        console.log(":::::::FINISHING THE READING OF NUMBERS FROM THE DB");

        console.log("READING OBJECTS FROM MODELS.......");
        modelsRef.on('child_added', snapshot => {
            /* Update React state when message is added at Firebase Database */
            let model = { text: snapshot.val(), id: snapshot.key };
            this.setState({
                models: [model].concat(this.state.models)
            });
        })
        console.log("FINISHING THE READING OF OBJECTS FROM MODELS.......");

        console.log("READING MESSAGES FROM THE DATABASE.......");
        messagesRef.on('child_added', snapshot => {
            /* Update React state when message is added at Firebase Database */
            let message = { text: snapshot.val(), id: snapshot.key };
            this.setState({
                messages: [message].concat(this.state.messages)
            });
        })
        console.log("FINISHING THE READING OF MESSAGES FROM THE DATABASE.......");

        DeviceStore.on("change", this.handleStateChange);
    }

    // ADD TO THE DATABASE - FUNCTION
    addMessage(e){
        e.preventDefault(); // <- prevent form submit from reloading the page
        /* Send the message to Firebase */
        fire.database().ref('messages').push( this.inputEl.value );
        this.inputEl.value = ''; // <- clear the input
    }

    componentWillUnmount() {
        DeviceStore.removeListener("change", this.handleStateChange);
    }

    handleStateChange() {
        this.setState({
            devices: DeviceStore.getAllDevices(),
            selectedDevice: DeviceStore.getSelectedDevice()
        });
    }

    handleOpenSetProperty = () => {
        this.setState({openSetProperty: true});
    };

    handleCloseSetProperty = () => {
        this.setState({openSetProperty: false});
    };

    handleChange = (event, index, selectValues) => {
        // this.state.attributeInputs[name] = "";

        this.setState({selectValues});
    }


    menuItems(selectValues) {
        var ExampleComponent = React.createClass({
            mixins: [dsfsdfdsf],
            // ...
        });
        if (!this.props.isPaletteItem) {
            // var names = DeviceStore.getPossiblePropertiesOfDevice(this.props.type);

            if (this.state.type != "") {
                var names = DeviceStore.getPossibleProperties(this.state.type);

                return names.map((name) => (
                    <MenuItem
                    key={name}
                    insetChildren={true}
                    checked={selectValues && selectValues.includes(name)}
                    value={name}
                    primaryText={name}
                    />
                ));
            }
            else {
                return [
                    <MenuItem
                    key={"unitialized"}
                    insetChildren={true}
                    checked={false}
                    value={"unitialized"}
                    primaryText={"unitialized"}
                    />
                ];
            }

        }
    }


    render() {



        let selectedDevice;

        if (this.state.selectedDevice != "") {
            selectedDevice = utils.getObjectFromGraphById(this.state.selectedDevice, this.state.devices);


            // Object.keys(selectedDevice).map((iterKey) => {
            //
            //   if (Array.isArray(selectedDevice[iterKey])) {
            //     selectedDevice[iterKey] = selectedDevice[iterKey].map((iterObject) => {
            //       const tempObject = utils.getObjectFromGraphById(iterObject["@id"], this.state.devices);
            //       return tempObject;
            //     });
            //   }
            //   else if (typeof selectedDevice[iterKey] == "object") {
            //     const tempObject = utils.getObjectFromGraphById(selectedDevice[iterKey]["@id"], this.state.devices);
            //     selectedDevice[iterKey] = tempObject;
            //   }
            // });
        }

        if (selectedDevice != null)
        utils.cleanOutAttributes(["@type"], selectedDevice);

        const actionsSetProperty = [
            <FlatButton
            label="Cancel"
            onTouchTap={this.handleCloseSetProperty}
            />,
            <FlatButton
            label="Save"
            primary={true}
            onTouchTap={ () => {
                DropActions.setProperty(this.state.id, [this.state.selectAttribute], this.state.textValue, this.state.key);
                this.handleCloseSetProperty();
                this.state.textValue = "";
            } }
            />
        ];

        const styles = {
            // position: 'absolute',
            // left: 465,
            // width: layout.width,
            // top: 5,
            maxHeight: '100%',
            height: '100%',
            border: '1px solid black',
            overflow: 'auto',    // enable scrollable here
            backgroundColor: '#cfd8dc'
        };

        if (selectedDevice == null) {

            return (
                <div ng-app='app' ng-controller="MyController">
                <h1> MY FRIEND {this.state.testString}</h1>
                <MuiThemeProvider>
                <div>
                <List style={styles}>
                <Subheader>Model Details</Subheader>

                <ListItem key={1} primaryText={"Select a device"} />
                </List>
                </div>
                </MuiThemeProvider>
                </div>
            );
        }
        // device selected, only show that information
        else {
            return (
                <div>
                <form onSubmit={this.addMessage.bind(this)}>
                <p> HERE.... </p>
                <input type="text" ref={ el => this.inputEl = el }/>
                <input type="submit"/>
                <ul>
                { /* Render the list of messages */
                    this.state.messages.map( message => <li key={message.id}>{message.text}</li> )
                }
                </ul>
                <p> ....HERE </p>
                <p> .. THE NUMBER BELLOW </p> // Just rendering the read number
                { /* Render the list of numbers */
                    this.state.numbers.map( number => <li key={number.id}>{number.text}</li> )
                }
                <p> .. THE NUMBER ABOVE </p>

                <h4> THE MODELS BELLOW</h4>
                { /* Render the list of models */
                    this.state.models.map( model => <li key={model.id}> {model.id}</li>) // This works as a ng-repeat in angularJS
                }

                <h4> THE MODELS ABOVE</h4>
                </form>
                <MuiThemeProvider>
                <div>
                <List style={styles}>
                <Subheader>Model Details</Subheader>
                {Object.keys(selectedDevice).map(key => {

                    // Array of objects as property value:
                    // 1. iterate through objects in array
                    // 2. if there are property values of the current object
                    // which are also object, we just show the id
                    if (Array.isArray(selectedDevice[key])) {
                        // list-element for device attribute
                        return (<ListItem key={key} primaryText={key} initiallyOpen={false} primaryTogglesNestedList={true} nestedItems={
                            selectedDevice[key].map((lowerDevice) => {

                                if (typeof lowerDevice === "object") {
                                    // list-element for each lower device in array (pin)
                                    return (<ListItem onClick={() => {if (selectedDevice["@id"] != lowerDevice["@id"]) DropActions.selectDevice(lowerDevice["@id"])}} key={selectedDevice[key].indexOf(lowerDevice)} primaryText={lowerDevice["@id"]} initiallyOpen={false} primaryTogglesNestedList={true} nestedItems={
                                        // sub-list-elements: traverse keys of lower device (pin)
                                        Object.keys(lowerDevice).map((lowerKey) => {
                                            if (lowerDevice[lowerKey]["@id"] != null)
                                            return (<ListItem onDoubleClick={ () => {
                                                const tempDevice = utils.getObjectFromGraphById(selectedDevice["@id"], this.state.devices);
                                                this.setState({id: tempDevice["@id"], type: tempDevice["@type"], selectAttribute: lowerKey});
                                                this.handleOpenSetProperty()
                                            } } key={lowerKey} primaryText={lowerKey + ": " + lowerDevice[lowerKey]["@id"]} />);
                                            else
                                            return (<ListItem onDoubleClick={ () => {
                                                const tempDevice = utils.getObjectFromGraphById(selectedDevice["@id"], this.state.devices);
                                                this.setState({id: tempDevice["@id"], type: tempDevice["@type"], selectAttribute: lowerKey});
                                                this.handleOpenSetProperty()
                                            } } key={lowerKey} primaryText={lowerKey + ": " + lowerDevice[lowerKey]} />);
                                        })
                                    } />);
                                }
                                // we have an array of primitve values as our attribute
                                else {
                                    return (<ListItem onDoubleClick={ () => {
                                        const tempDevice = utils.getObjectFromGraphById(selectedDevice["@id"], this.state.devices);
                                        this.setState({id: tempDevice["@id"], type: tempDevice["@type"], selectAttribute: key, key: selectedDevice[key].indexOf(lowerDevice)});
                                        this.handleOpenSetProperty()
                                    } }
                                    key={selectedDevice[key].indexOf(lowerDevice)} primaryText={selectedDevice[key].indexOf(lowerDevice) + ": " + lowerDevice} />);
                                }

                            })
                        } />);
                    }
                    // Object as property value:
                    // if there are property values of this object
                    // which are also object, we just show the id
                    else if (!Array.isArray(selectedDevice[key]) && typeof selectedDevice[key] == "object" && selectedDevice[key]["@id"] != null) {

                        return (<ListItem onClick={() => DropActions.selectDevice(selectedDevice[key]["@id"])}
                        onDoubleClick={ () => {
                            const tempDevice = utils.getObjectFromGraphById(selectedDevice["@id"], this.state.devices);
                            this.setState({id: tempDevice["@id"], type: tempDevice["@type"], selectAttribute: key});
                            this.handleOpenSetProperty()
                        } } key={key} primaryText={key + ": " + selectedDevice[key]["@id"]} initiallyOpen={false} primaryTogglesNestedList={true} />);
                    }
                    // primitive data as property value
                    else
                    return (<ListItem onDoubleClick={ () => {
                        const tempDevice = utils.getObjectFromGraphById(selectedDevice["@id"], this.state.devices);
                        this.setState({id: tempDevice["@id"], type: tempDevice["@type"], selectAttribute: key});
                        this.handleOpenSetProperty()
                    } }
                    key={key} primaryText={key + ": " + selectedDevice[key]} />);

                })}
                </List>

                <Dialog
                title="Set Property"
                actions={actionsSetProperty}
                modal={false}
                open={this.state.openSetProperty}
                onRequestClose={this.handleCloseSetProperty}
                >
                <TextField value={this.state.textValue} onChange={ (e) => {this.setState({textValue: e.target.value}) } }
                hintText="New Value"
                />
                </Dialog>

                </div>
                </MuiThemeProvider>
                </div>
            );
        }

    }


}
