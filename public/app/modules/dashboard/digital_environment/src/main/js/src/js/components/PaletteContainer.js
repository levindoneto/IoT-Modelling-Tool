import Device from './Device';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ItemTypes from '../dnd/ItemTypes';
import React, { Component, PropTypes } from 'react';
import update    from    'react/lib/update';
import { List, ListItem } from 'material-ui/List';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Subheader from 'material-ui/Subheader';
import { definitions } from '../constants/definitions';
import * as utils from '../utils/utils';
import fire from '../database/fire' // Database to be accessed for this part of the application
import reactfire from 'reactfire' // Binding between the database and reactjs


const paletteItemsStyles = {
    left: 5,
    top: 40
};

var list_infos_devices = []; // List with information about devices, sensors and actuators in the database
var list_devices = []; // list_infos_devices.type == "device"
var list_sensors = []; // list_infos_devices.type == "sensor"
var list_actuators = []; // list_infos_devices.type == "actuator"

const styles = {
    height: '100%',
    width: '100%',
    border: '1px solid black',
    overflow: 'auto', // enable scrollable here
};

const boxTarget = {
    drop(props, monitor, component) {
        // do nothing
    }
};

class PaletteContainer extends Component {
    static propTypes = {
        hideSourceOnDrag: PropTypes.bool.isRequired,
        connectDropTarget: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        var allIcons = {}; //Object with the icons of the devices (basis 64)

        const lstComponenents = {
            Device: [], // list_infos_devices.type == "Device"
            SensingDevice: [], // list_infos_devices.type == "SensingDevice"
            ActuatingDevice: [], // list_infos_devices.type == "ActuatingDevice"
        };

        const one_id_random = "RaspberryPiTwo"

        function Component(element) {
            this.numberOfPins = element.NumberOfPins;
            this.id = element.id;
            this.iconComponentKey = element.imageFile; // This key is used to access the correct image in the another data structure
            this.ownerUser = element.userUid;
        }

        function createComponent(element) {
            /* if element.type is definied */
            return lstComponenents["Device"].push(new Component(element)); // returns a promise
        }

        // Reading data from the database (key: images) and setting it into the local storage
        firebase.database().ref("images").orderByKey().once("value")
        .then(function(snapshot) { // after function(snapshot)
            snapshot.forEach(function(childSnapshot) {
                allIcons[childSnapshot.key] = childSnapshot.val();
                localStorage.setItem(childSnapshot.key, childSnapshot.val());
            });
        });
        // Reading data from the database (key: "models")
        firebase.database().ref("models").orderByKey().once("value")
        .then(function(snapshot) { // after function(snapshot)
            snapshot.forEach(function(childSnapshot) {  // Loop into database's information
            //var key = childSnapshot.key;
                switch (childSnapshot.val().type) {
                    case "Device":
                        createComponent(childSnapshot.val());
                        localStorage.setItem(childSnapshot.key, childSnapshot.val().id); // Key:Id will be able to access from the whole application
                        break;
                    case "SensingDevice":
                        createComponent(childSnapshot.val());
                        localStorage.setItem(childSnapshot.key, childSnapshot.val().id);
                        break;
                    case "ActuatingDevice":
                        createComponent(childSnapshot.val());
                        localStorage.setItem(childSnapshot.key, childSnapshot.val().id);
                        break;
                    default:
                        createComponent(childSnapshot.val());
                        localStorage.setItem(childSnapshot.key, childSnapshot.val());
                }
            });
        }).then(function(createComponent) {
            //var global = "across";
            //localStorage.setItem('text', lstComponenents.Device["0"].id);
            console.log("THEN (IN CLIENT) ", lstComponenents.Device["0"].id); // Now the value isn't undefined

        });

    var imgRandomFromBD;
    this.imgRandomFromBD = localStorage.getItem('-KmO9pKQmrM-qMmXYk36');
    console.log("THE PATH IMG: ", imgRandomFromBD);
}

render() {

    let oneImg = this.imgRandomFromBD;


    /*
    const NumberComponent = props => (<td>{ props.number }</td>);

    const Resultset = props => (
        <tr>
            {
                props.rows.map( number => <NumberComponent number={number} />)
            }
        </tr>
    );
    */
    const devices_content = list_devices.map(deviceInfo =>
            <div>
                <h1>{deviceInfo}</h1>
            </div>
        );

    const sensors_content = list_sensors.map(sensorInfo =>

        <div>
        <h1>{sensorInfo}</h1>
        </div>
    );
    const actuators_content = list_actuators.map(actuatorInfo =>
        <div>
        <h1>{actuatorInfo}</h1>
        </div>
    );

    const { hideSourceOnDrag, connectDropTarget } = this.props;
    const definitionsDevices = definitions["@graph"].filter((iterObject) => {
        return !["owl:DatatypeProperty", "owl:ObjectProperty", "owl:AnnotationProperty"].includes(iterObject["@type"]);
    });

    // for key and y-value
    let tempCount = -1;


    return connectDropTarget(
        <div style={styles}>
        <MuiThemeProvider>
        <List>

        <Subheader>Devices</Subheader>
        {definitionsDevices.map(iterDevice => {

            let isDevice = false;
            if (Array.isArray(iterDevice["rdfs:subClassOf"]))
            iterDevice["rdfs:subClassOf"].map((iterSubClass) => {
                if (iterSubClass["@id"] === "ssn:Device")
                isDevice = true;
            });

            if ( iterDevice["@id"].startsWith("ipvs:") && isDevice ) {

                tempCount = tempCount + 1;

                return (
                    <Device class="col-sm-3" key={tempCount + 1}
                    id={iterDevice["@id"]}
                    left={paletteItemsStyles.left}
                    top={paletteItemsStyles.top * (tempCount + 1)}
                    type={iterDevice["@id"]}
                    isPaletteItem={true}
                    hideSourceOnDrag={hideSourceOnDrag}>
                    </Device>
                );
            }
        })}
        <Subheader>Sensors</Subheader>
        {definitionsDevices.map(
            iterDevice => {
                if ( iterDevice["@id"].startsWith("ipvs:") && iterDevice["rdfs:subClassOf"] && utils.getParentClasses(iterDevice["@id"]).includes("ssn:SensingDevice") ) {

                    tempCount = tempCount + 1;

                    return (
                        <Device class="col-sm-3" key={tempCount + 1}
                        id={iterDevice["@id"]}
                        left={paletteItemsStyles.left}
                        top={paletteItemsStyles.top * (tempCount + 1)}
                        type={iterDevice["@id"]}
                        isPaletteItem={true}
                        hideSourceOnDrag={hideSourceOnDrag}>
                        </Device>
                    );
                }
            }
        )}


        <Subheader>Actuators</Subheader>

        {definitionsDevices.map(
            iterDevice => {
                if ( iterDevice["@id"].startsWith("ipvs:") && iterDevice["rdfs:subClassOf"] && utils.getParentClasses(iterDevice["@id"]).includes("iot-lite:ActuatingDevice") ) {
                    tempCount = tempCount + 1;

                    return (
                            <Device class="col-sm-3" key={tempCount + 1}
                            id={iterDevice["@id"]}
                            left={paletteItemsStyles.left}
                            top={paletteItemsStyles.top * (tempCount + 1)}
                            type={iterDevice["@id"]}
                            isPaletteItem={true}
                            hideSourceOnDrag={hideSourceOnDrag}>
                            </Device>
                    );
                }
            }
        )}
        </List>
        </MuiThemeProvider>
        </div>
    );
}
}



export default DropTarget(ItemTypes.BOX, boxTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))(PaletteContainer);
