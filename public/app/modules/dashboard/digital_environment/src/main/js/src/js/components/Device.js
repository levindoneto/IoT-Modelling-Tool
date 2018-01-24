import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import MenuItem from 'material-ui/MenuItem';
import { ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import ItemTypes from '../dnd/ItemTypes';
import * as DropActions from '../actions/DropActions';
import DeviceStore from '../stores/DeviceStore';
import * as utils from '../utils/utils';

const DEL = 46;
const SELECTED_DEV = 'selectedDevice';
const boxSource = {
    beginDrag(props) {
        const { id, left, top, type, isPaletteItem } = props;
        return { id, left, top, type, isPaletteItem };
    }
};

class Device extends Component {
    static propTypes = {
        connectDragSource: PropTypes.func.isRequired,
        isDragging: PropTypes.bool.isRequired,
        id: PropTypes.any.isRequired,
        left: PropTypes.number.isRequired,
        top: PropTypes.number.isRequired,
        hideSourceOnDrag: PropTypes.bool.isRequired,
        children: PropTypes.node
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedDevice: false,
            open: false,
            openSetProperty: false,
            selectValues: [],
            textValue: ''
        };
    }

    /* Overwrite screenshot of DragPreview from HTML5
     * This is what will be showed when Device is dragged from Palette */
    componentDidMount() {
        const { connectDragPreview } = this.props;
        const parentClasses = utils.getParentClasses(this.props.type);
        if (this.props.isPaletteItem && parentClasses.includes('ssn:SensingDevice')) {
            const sensorImage = new Image();
            sensorImage.src = localStorage.getItem(this.props.type.substr(5, this.props.type.length));
            sensorImage.onload = () => connectDragPreview(sensorImage);
        } else if (this.props.isPaletteItem && parentClasses.includes('ssn:Device') && !parentClasses.includes('iot-lite:ActuatingDevice')) {
            const deviceImage = new Image();
            deviceImage.src = localStorage.getItem(this.props.type.substr(5, this.props.type.length));
            deviceImage.onload = () => connectDragPreview(deviceImage);
        } else if (this.props.isPaletteItem && parentClasses.includes('iot-lite:ActuatingDevice')) {
            const actuatorImage = new Image();
            actuatorImage.src = localStorage.getItem(this.props.type.substr(5, this.props.type.length));
            actuatorImage.onload = () => connectDragPreview(actuatorImage);
        }
    }

    componentWillUnmount() { // It should be placed after componentDidMount 
        DeviceStore.removeListener('change', this.getSelectedDevice);
    }

    getSelectedDevice = () => {
        this.setState({
            selectedDevice: DeviceStore.getSelectedDevice()
        });
    };

    handleRequestClose = () => { // It should be placed after getSelectedDevice 
        this.setState({
            open: false,
            anchorEl: null
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
        this.setState({ openSetProperty: true });
    };

    handleCloseSetProperty = () => {
        this.setState({ openSetProperty: false });
    };

    handleKeysDevice = (e) => {
        const key = e.keyCode || e.charCode || 0;
        if (key === DEL) {
            this.deleteDevice();
            document.body.removeEventListener('keyup', this.handleKeysDevice);
        }
    };

    /* If the device is selected, it deletes the selected one
     * and deletes the device from the store */
    deleteDevice = () => {
        if (this.state.selectedDevice === this.props.id) {
            DropActions.selectDevice('');
            DropActions.deleteDevice(this.props.id);
        }
    };

    handleClick = (e) => {
        localStorage.setItem(SELECTED_DEV, this.props.id);
        e.stopPropagation();
        if (DeviceStore.getSelectedDevice() === this.props.id) { 
            DropActions.selectDevice('');
        } 
        else {
            DropActions.selectDevice(this.props.id);
        }
    };

    handleChange = (event, index, selectValues) => {
        this.setState({ selectValues });
    };

    menuItems(selectValues) {
        if (!this.props.isPaletteItem) {
            const devices = DeviceStore.getAllDevices();
            const thisDevice = devices.find((iterDevice) => (iterDevice['@id'] === this.props.id));
            const names = Object.keys(thisDevice);

            return names.map((name) => (
                <MenuItem
                    key={name}
                    insertChildren // ={true}
                    checked={selectValues && selectValues.includes(name)}
                    value={name}
                    primaryText={name}
                />
            ));
        }
    }

    render() {
        const { hideSourceOnDrag, left, top, type, connectDragSource, isDragging, children, id, isPaletteItem, key } = this.props;
        let sensingDeviceAvatar;
        let deviceAvatar;
        let actuatingDeviceAvatar;
        let isDevice = false;
        let isSensingDevice = false;
        let isActuatingDevice = false;

        /* Set icons for Devices/Components */
        const parentClasses = utils.getParentClasses(this.props.type);
        if (parentClasses.includes('ssn:SensingDevice')) {
            sensingDeviceAvatar = (<Avatar src={localStorage.getItem(this.props.type.substr(5, this.props.type.length))} style={{ backgroundColor: '#dcedc8', borderRadius: '0%', border: '1.5px dotted gray' }} />);
            isSensingDevice = true;
        } else if (parentClasses.includes('ssn:Device') && !parentClasses.includes('iot-lite:ActuatingDevice')) {
            deviceAvatar = (<Avatar src={localStorage.getItem(this.props.type.substr(5, this.props.type.length))} style={{ backgroundColor: '#dcedc8', borderRadius: '0%', border: '1.5px dotted gray' }} />);
            isDevice = true;
        } else if (parentClasses.includes('iot-lite:ActuatingDevice')) {
            actuatingDeviceAvatar = (<Avatar src={localStorage.getItem(this.props.type.substr(5, this.props.type.length))} style={{ backgroundColor: '#dcedc8', borderRadius: '0%', border: '1.5px dotted gray' }} />);
            isActuatingDevice = true;
        }

        let backgroundColor;
        if (this.state.selectedDevice === id) {
            backgroundColor = 'lightgreen';
        } else {
            backgroundColor = 'white';
        }

        const style = {
            position: 'absolute',
            border: '1px ridge gray',
            backgroundColor,
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
            <FlatButton label="Cancel" onTouchTap={this.handleCloseSetProperty} />,
            <FlatButton
                label="Save" primary onTouchTap={() => {
                    DropActions.setProperty(id, [this.state.selectValues], this.state.textValue);
                    this.handleCloseSetProperty();
                }}
            />
        ];


        if (this.state.selectedDevice === id) {
            document.body.addEventListener('keyup', this.handleKeysDevice);
        }        
        else {
            document.body.removeEventListener('keyup', this.handleKeysDevice);
        }

        /* Render Devices/Component on the Palette */
        if (isPaletteItem && isSensingDevice) {
            return connectDragSource(
                <div id={id} key={id}>
                    <ListItem
                        key={id} primaryText={id.replace(/(\w)*:/, '')}
                        leftAvatar={sensingDeviceAvatar}
                        style={{ backgroundColor: '#fff59d' }}
                    >
                    </ListItem >
                </div>
            );
        } 
        else if (isPaletteItem && isDevice) {
            return connectDragSource(
                <div id={id} key={id}>
                    <ListItem
                        key={id} primaryText={id.replace(/(\w)*:/, '')}
                        leftAvatar={deviceAvatar}
                        style={{ backgroundColor: '#dcedc8' }}
                    >
                    </ListItem >
                </div>
            );
        } 
        else if (isPaletteItem && isActuatingDevice) {
            return connectDragSource(
                <div id={id} key={id}>
                    <ListItem
                        key={id} primaryText={id.replace(/(\w)*:/, '')}
                        leftAvatar={actuatingDeviceAvatar}
                        style={{ backgroundColor: '#b3e5fc' }}
                    >
                    </ListItem >
                </div>
            );
        }

        /* Render Devices (dropped Devices) into the DropContainer */
        return connectDragSource(
            <img
                id={id} onClick={this.handleClick}
                src={localStorage.getItem(this.props.type.substr(5, this.props.type.length))}
                style={{ ...style, left, top }}
            />    
        );
    }
}

export default DragSource(ItemTypes.BOX, boxSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview()
})
)(Device);
