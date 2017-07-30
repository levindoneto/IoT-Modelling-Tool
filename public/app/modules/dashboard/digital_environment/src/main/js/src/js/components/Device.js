import DeviceStore from "../stores/DeviceStore";
import FlatButton from 'material-ui/FlatButton';
import React, { Component, PropTypes, SyntheticEvent } from 'react';
import ItemTypes from '../dnd/ItemTypes';
import { DragSource } from 'react-dnd';
import * as DropActions from '../actions/DropActions';
import MenuItem from 'material-ui/MenuItem';
import { ListItem } from 'material-ui/List';
import * as utils from '../utils/utils';
import Avatar from 'material-ui/Avatar';


const boxSource = {
  beginDrag(props) {
    const { id, left, top, type, isPaletteItem } = props;
    return { id, left, top, type, isPaletteItem };
  }
};


class Device extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedDevice: false,
      open: false,
      openSetProperty: false,
      selectValues: [],
      textValue: ""
    };
  }

  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    id: PropTypes.any.isRequired,
    left: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    hideSourceOnDrag: PropTypes.bool.isRequired,
    children: PropTypes.node
  };

  componentWillMount() {
    DeviceStore.on("change", this.getSelectedDevice);
  }

  componentWillUnmount() {
    DeviceStore.removeListener("change", this.getSelectedDevice);
  }

  /*
   * Overwrite screenshot of DragPreview from HTML5
   * This is what will be showed when Device is dragged from Palette
   */
  componentDidMount() {
      const { connectDragPreview } = this.props;

      let parentClasses = utils.getParentClasses(this.props.type);
      if (this.props.isPaletteItem && parentClasses.includes("ssn:SensingDevice")) {
          const sensorImage = new Image();
          sensorImage.src = "images/Temp-Sensor.png";
          sensorImage.onload = () => connectDragPreview(sensorImage);
      } else if(this.props.isPaletteItem && parentClasses.includes("ssn:Device") && !parentClasses.includes("iot-lite:ActuatingDevice")) {
          const deviceImage = new Image();
          deviceImage.src = "images/" + this.props.type.substr(5, this.props.type.length) + ".png";
          deviceImage.onload = () => connectDragPreview(deviceImage);
      } else if(this.props.isPaletteItem && parentClasses.includes("iot-lite:ActuatingDevice")) {
          const actuatorImage = new Image();
          actuatorImage.src = "images/" + this.props.type.substr(5, this.props.type.length) + ".png";
          actuatorImage.onload = () => connectDragPreview(actuatorImage);
      }
  }


  handleRequestClose = () => {
    this.setState({
      open: false,
      anchorEl: null
    });
  };


  getSelectedDevice = () => {
    this.setState({
      selectedDevice: DeviceStore.getSelectedDevice()
    });
  };


  selectDevice = () => {
    this.setState({
      isSelected: !this.state.isSelected
    });
  };


  selectDeviceOptions = (e) => {
    e.preventDefault();

    this.setState({
      open: true,
      anchorEl: e.currentTarget,
    });
  };



  handleOpenSetProperty = () => {
   this.setState({openSetProperty: true});
  };

  handleCloseSetProperty = () => {
    this.setState({openSetProperty: false});
  };


  handleKeysDevice = (e) => {
    const key = e.keyCode || e.charCode || 0;

    if (key == 46) {
      this.deleteDevice();
      document.body.removeEventListener('keyup', this.handleKeysDevice);
    }
  };

  // if device was selected, delete selection
  // and delete device from store
  deleteDevice = () => {
    if (this.state.selectedDevice == this.props.id) {
        DropActions.selectDevice("");
        DropActions.deleteDevice(this.props.id);
    }
  };

  handleClick = (e) => {
    e.stopPropagation();

    if (DeviceStore.getSelectedDevice() == this.props.id)
      DropActions.selectDevice("");
    else
      DropActions.selectDevice(this.props.id);
  };

  handleChange = (event, index, selectValues) => {
    // this.state.attributeInputs[name] = "";
    this.setState({selectValues});
  };



  menuItems(selectValues) {

    if (!this.props.isPaletteItem) {
      // var names = DeviceStore.getPossiblePropertiesOfDevice(this.props.type);

      const devices = DeviceStore.getAllDevices();
      const thisDevice = devices.find((iterDevice) => (iterDevice["@id"] === this.props.id));
      const names = Object.keys(thisDevice);

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
  }


  render() {
    const { hideSourceOnDrag, left, top, type, connectDragSource, isDragging, children, id, isPaletteItem, key } = this.props;

      let sensingDeviceAvatar = undefined;
      let deviceAvatar = undefined;
      let actuatingDeviceAvatar = undefined;

      let isDevice = false;
      let isSensingDevice = false;
      let isActuatingDevice = false;

      // setting icons for Devices
      let parentClasses = utils.getParentClasses(this.props.type);
      if (parentClasses.includes("ssn:SensingDevice")) {
          sensingDeviceAvatar = (<Avatar src="images/Temp-Sensor.png" style={{'backgroundColor': '#fff59d', 'borderRadius':'0%', 'border':'1.5px dotted gray'}}/>);
          isSensingDevice = true;
      } else if(parentClasses.includes("ssn:Device") && !parentClasses.includes("iot-lite:ActuatingDevice")) {
          deviceAvatar = (<Avatar src={"images/" + this.props.type.substr(5, this.props.type.length) + ".png"} style={{'backgroundColor': '#dcedc8', 'borderRadius':'0%', 'border':'1.5px dotted gray'}}/>);
          isDevice = true;
      } else if(parentClasses.includes("iot-lite:ActuatingDevice")) {
          actuatingDeviceAvatar = (<Avatar src={"images/" + this.props.type.substr(5, this.props.type.length) + ".png"} style={{'backgroundColor': '#b3e5fc', 'borderRadius':'0%', 'border':'1.5px dotted gray'}}/>);
          isActuatingDevice = true;
      }


    let backgroundColor;
    if (this.state.selectedDevice == id) {
      backgroundColor = "lightgreen";
    }
    else {
      backgroundColor = "white";
    }

    const style = {
      position: 'absolute',
      border: '1px ridge gray',
      backgroundColor: backgroundColor,
      padding: '0.5rem 1rem',
      cursor: 'move',
      height: 50,
      width: 50,
      borderRadius: '0%'
    };

    if (isDragging && hideSourceOnDrag) {
      return null;
    }


    const actionsSetProperty = [
      <FlatButton label="Cancel" onTouchTap={this.handleCloseSetProperty} /> ,
      <FlatButton label="Save" primary={true} onTouchTap={ () => {  DropActions.setProperty(id, [this.state.selectValues], this.state.textValue);
                                                                    this.handleCloseSetProperty();  }} />
    ];


    if (this.state.selectedDevice == id) {
      document.body.addEventListener('keyup', this.handleKeysDevice);
    }
    else {
      document.body.removeEventListener('keyup', this.handleKeysDevice);
    }

    // render Devices in Palette
    if (isPaletteItem && isSensingDevice) {
      return connectDragSource(
        <div id={id} key={id}>
          <ListItem key={id} primaryText={id.replace(/(\w)*:/, "")}
                    leftAvatar={sensingDeviceAvatar}
                    style={{'backgroundColor': '#fff59d'}}>
          </ListItem >
        </div>
      );
    } else if(isPaletteItem && isDevice) {
        return connectDragSource(
            <div id={id} key={id}>
              <ListItem key={id} primaryText={id.replace(/(\w)*:/, "")}
                        leftAvatar={deviceAvatar}
                        style={{'backgroundColor': '#dcedc8'}}>
              </ListItem >
            </div>
        );
    } else if(isPaletteItem && isActuatingDevice) {
        return connectDragSource(
            <div id={id} key={id}>
              <ListItem key={id} primaryText={id.replace(/(\w)*:/, "")}
                        leftAvatar={actuatingDeviceAvatar}
                        style={{'backgroundColor': '#b3e5fc'}}>
              </ListItem >
            </div>
        );
    }

    // render Devices (dropped Devices) inside DropContainer
    else {
        return connectDragSource(
           <img id={id} onClick={this.handleClick}
                 src={"images/" + this.props.type.substr(5, this.props.type.length) + ".png"}
                 style={{...style, left, top}}/>
        );
    }
  }

}


export default DragSource(ItemTypes.BOX, boxSource, (connect, monitor) => ({
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
      connectDragPreview: connect.dragPreview()})
)(Device);
