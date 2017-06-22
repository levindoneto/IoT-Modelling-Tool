import Device from './Device';
import DeviceStore from "../stores/DeviceStore";
import * as DropActions from '../actions/DropActions';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ItemTypes from '../dnd/ItemTypes';
import React, { Component, PropTypes } from 'react';
import update from 'react/lib/update';
import * as utils from '../utils/utils';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';


const paletteContainerWidth = 100;
const paletteContainerHeight = 300;
const myListWidth = 205;

const boxTarget = {
  drop(props, monitor, component) {

    const item = monitor.getItem();
    const delta = monitor.getDifferenceFromInitialOffset();
    const type = item.type;
    const isPaletteItem = item.isPaletteItem;



    if (isPaletteItem == true) {
      const paletteContainerWidth = document.getElementById("palette-container").offsetWidth;
      const left = Math.round(item.left + delta.x - paletteContainerWidth);
      const top = Math.round(item.top + delta.y);

      const newItem = { top: top, left: left, type: type }

      DropActions.createDevice(newItem);
    }
    else {
      const left = Math.round(item.left + delta.x);
      const top = Math.round(item.top + delta.y);

      const devices = DeviceStore.getAllDevices();

      devices.map(() => {

      });

      component.moveDevice(item.id, left, top);
    }

  }
};


class DropContainer extends Component {


  static propTypes = {
    hideSourceOnDrag: PropTypes.bool.isRequired,
    connectDropTarget: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.getDevices = this.getDevices.bind(this);
    this.state = {
      devices: DeviceStore.getAllDevices(),
      height: 0,
      width: 0
    };
  }

  // updateDimensions() {
  //   // this.setState({width: window.innerWidth - paletteContainerWidth - myListWidth - 10, height: window.innerHeight - 100});
  //   if ((window.innerWidth - paletteContainerWidth - myListWidth - 10) < window.innerHeight) {
  //     this.setState({width: window.innerWidth - paletteContainerWidth - myListWidth - 10, height: window.innerWidth - paletteContainerWidth - myListWidth - 10});
  //   }
  //   else {
  //     this.setState({width: window.innerWidth - paletteContainerWidth - myListWidth - 10, height: window.innerHeight - 100});
  //   }
  // }

  componentWillMount() {
    DeviceStore.on("change", this.getDevices);
    // this.updateDimensions();
    // window.addEventListener('resize', this.updateDimensions());
  }


  componentWillUnmount() {
    DeviceStore.removeListener("change", this.getDevices);
  }

  getDevices() {
    this.setState({
      devices: DeviceStore.getAllDevices(),
    });
  }


  moveDevice(id, left, top) {

    const tempDevice = this.state.devices.find(function(device) {
        return device["@id"] == id;
    });


    // check, whether the device can be moved at all
    // TODO: check for ssn prefix in context of onPlatform
    if (tempDevice["geo:location"]) {
      const tempDeviceLocation = utils.getObjectFromGraphById(tempDevice["geo:location"]["@id"], this.state.devices);


      if (tempDevice["geo:location"]) {
        DropActions.setProperty(tempDeviceLocation["@id"], "geo:long", left);
        DropActions.setProperty(tempDeviceLocation["@id"], "geo:lat", top);
      }
    }
  }


  handleKeysSelectedDevice = (e) => {
    var key = e.keyCode || e.charCode || 0;

    if (key == 27) {
      DropActions.selectDevice("")
      document.body.removeEventListener('keyup', this.handleKeysSelectedDevice);
    }
  }

  render() {


    const { hideSourceOnDrag, connectDropTarget } = this.props;
    const { devices } = this.state;


    const styles = {
        // position: 'absolute',
        // left: 160,
        // // top: 5,
        // width: 300,
      position: 'relative',
      overflow: 'auto',
      height: '100%',
      border: '1px solid black',
      backgroundSize: '40px 40px',
      backgroundImage: 'linear-gradient(to right, grey 0.5px, transparent 0.6px), linear-gradient(to bottom, grey 0.5px, transparent 0.6px)'
    };

    const canvasStyles = {
      width: '100%',
      height: '100%'
    };


    if (DeviceStore.getSelectedDevice != "") {
      document.body.addEventListener('keyup', this.handleKeysSelectedDevice);
    }
    else {
      document.body.removeEventListener('keyup', this.handleKeysSelectedDevice);
    }

    let lines = [];


    return connectDropTarget(
      <div onClick={() => {DropActions.selectDevice("")}} style={styles}>
        {devices.map(storedDevice => {

          let tempLeft = 0;
          let tempTop = 0;

          // get location and draw arrow
          if (storedDevice["geo:location"]) {
            const storedDeviceLocation = utils.getObjectFromGraphById(storedDevice["geo:location"]["@id"], devices);

            tempLeft = parseInt(storedDeviceLocation["geo:long"]);
            tempTop = parseInt(storedDeviceLocation["geo:lat"]);

            // draw arrow
            if (storedDevice["iot-lite:isSubSystemOf"] != null && storedDevice["iot-lite:isSubSystemOf"]["@id"] != storedDevice["@id"]) {
              const targetDeviceId = storedDevice["iot-lite:isSubSystemOf"]["@id"];
              const targetDevice = utils.getObjectFromGraphById(targetDeviceId, devices);
              const targetDeviceLocation =  utils.getObjectFromGraphById(targetDevice["geo:location"]["@id"], devices);
              const targetLeft = parseInt(targetDeviceLocation["geo:long"]);
              const targetTop = parseInt(targetDeviceLocation["geo:lat"]);


              const markerId = "arrow"
              // lines.push(
              //   (
              //
              //     <defs>
              //       <marker id={markerId} markerWidth={"10"} markerHeight={"10"} refX={"0"} refY={"3"} orient={"auto"} markerUnits={"strokeWidth"}>
              //         <path d={"M0,0 L0,6 L9,3 z"} fill={"#f00"} />
              //       </marker>
              //     </defs>
              //   )
              // );
              lines.push(
                (
                  <line x1={tempLeft} y1={tempTop} x2={targetLeft} y2={targetTop} style={{stroke: '#000000', strokeWidth: 2}} />
                )
              );
            }

          }



          const isSubClassOfSystem = utils.includesTypesInParentClasses("ssn:System", utils.getParentClasses(storedDevice["@type"]))

          if (isSubClassOfSystem)
            return (
              <Device key={devices.indexOf(storedDevice)}
                   id={storedDevice["@id"]}
                   left={tempLeft}
                   top={tempTop}
                   type={storedDevice["@type"]}
                   hideSourceOnDrag={hideSourceOnDrag}>
              </Device>
            );
        })}
        <svg height="100%" width="100%">
          {lines}
        </svg>
      </div>
    );
  }
}


export default DropTarget(ItemTypes.BOX, boxTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))(DropContainer);
