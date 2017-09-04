import { DropTarget } from 'react-dnd';
import React, { Component, PropTypes } from 'react';
import DeviceStore from '../stores/DeviceStore';
import Device from './Device';
import * as DropActions from '../actions/DropActions';
import ItemTypes from '../dnd/ItemTypes';
import * as utils from '../utils/utils';

const boxTarget = {
    drop(props, monitor, component) {
        const item = monitor.getItem();
        const delta = monitor.getDifferenceFromInitialOffset();
        const type = item.type;
        const isPaletteItem = item.isPaletteItem;

        /* First drop (drag from Palette) */
  
        if (isPaletteItem === true) {
            const listElement = document.getElementById(item.id);
            const listElementLeft = listElement.offsetLeft;
            const listElementTop = listElement.offsetTop;
            const paletteContainerWidth = document.getElementById('palette-container').offsetWidth;
            const dropContainerElement = document.getElementById('drop-container');
            let left = null;
            let top = null;

            // Prevent Devices leaving bottom left (TODO: STILL NOT WORKING, need to be fixed)
            if (Math.round(listElementLeft + delta.x - paletteContainerWidth) < 0 && Math.round(item.top + delta.y) > (dropContainerElement.offsetHeight - 50)) {
                left = 0;
                top = dropContainerElement.offsetHeight - 50;
            } // Prevent Devices leaving top right bound
            else if (Math.round(listElementTop + delta.y) < 0 && Math.round(listElementLeft + delta.x - paletteContainerWidth) > (dropContainerElement.offsetWidth - 50)) {
                left = dropContainerElement.offsetWidth - 50;
                top = 0;
            } // revent Devices leaving top left, top or left bounds
            else if (Math.round(listElementLeft + delta.x - paletteContainerWidth) < 0 || Math.round(listElementTop + delta.y) < 0) {
                left = Math.max(0, Math.round(listElementLeft + delta.x - paletteContainerWidth));
                top = Math.max(0, Math.round(listElementTop + delta.y));
            } // Prevent Devices leaving bottom right, bottom or right bounds
            else {
                left = Math.min(Math.round(listElementLeft + delta.x - paletteContainerWidth), dropContainerElement.offsetWidth - 50);
                top = Math.min(Math.round(listElementTop + delta.y), dropContainerElement.offsetHeight - 50);
            }
            const newItem = { top, left, type };
            DropActions.createDevice(newItem);
        }
        /* Drag and drop inside the DropContainer */
        else {
            const dropContainerElement = document.getElementById('drop-container');
            const left = Math.min(Math.round(item.left + delta.x), dropContainerElement.offsetWidth - 50);    // LEFT is geo:long
            const top = Math.min(Math.round(item.top + delta.y), dropContainerElement.offsetHeight - 50);     // TOP is geo:lat
            const devices = DeviceStore.getAllDevices();
            let isCloseToOtherDevice = false;
            let tempDevice = null;
            let isTargetDevice = false;

            devices.map((iterDevice) => {
                const tempLocation = devices.find((iterObject) => {
                    if (iterDevice['geo:location']) {
                        console.log("LOC 01", iterDevice['geo:location']['@id']);
                        return iterDevice['geo:location']['@id'] === iterObject['@id'];
                    }
                });

                if (tempLocation != null && item.id !== iterDevice['@id']) {
                    const diffX = Math.abs(tempLocation['geo:lat'] - top);
                    const diffY = Math.abs(tempLocation['geo:long'] - left);

                    if (diffX <= 50 && diffY <= 50) {
                        isCloseToOtherDevice = true;
                        tempDevice = iterDevice;
                        isTargetDevice = !utils.getParentClasses(tempDevice['@type']).includes('iot-lite:ActuatingDevice') && !utils.getParentClasses(tempDevice['@type']).includes('ssn:SensingDevice');
                    }
                }
            });

            if (isCloseToOtherDevice && isTargetDevice) {
                DropActions.setProperty(item.id, 'iot-lite:isSubSystemOf', tempDevice['@id']);
            } 
            else if (!isCloseToOtherDevice) {
                component.moveDevice(item.id, left, top);
            }
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
        this.handleStateChange = this.handleStateChange.bind(this);
        this.state = {
            devices: DeviceStore.getAllDevices(),
            deviceTypes: DeviceStore.getDeviceTypes(),
            height: 0,
            width: 0,
            hover: false
        };
    }

    componentWillMount() {
        DeviceStore.on('change', this.handleStateChange);
    }

    componentWillUnmount() {
        DeviceStore.removeListener('change', this.handleStateChange);
    }

    handleStateChange() {
        this.setState({
            devices: DeviceStore.getAllDevices(),
        });

        if (DeviceStore.isSetPropertyOpen === true) {
            document.body.removeEventListener('keyup', this.handleKeysSelectedDevice);
        }
        else {
            document.body.addEventListener('keyup', this.handleKeysSelectedDevice);
        }
    }

    moveDevice(id, left, top) {
        const tempDevice = this.state.devices.find((device) => device['@id'] === id);
        if (tempDevice['geo:location']) {
            const tempDeviceLocation = utils.getObjectFromGraphById(tempDevice['geo:location']['@id'], this.state.devices);
            /* Devices won't leave the DropContainer's bounds when being moved inside */
            if (tempDevice['geo:location'] && left >= 0 && top >= 0) {
                DropActions.setProperty(tempDeviceLocation['@id'], 'geo:long', left);
                DropActions.setProperty(tempDeviceLocation['@id'], 'geo:lat', top);
            }
        }
    }

    // handle unselecting a Device (with 'ESC' key)
    handleKeysSelectedDevice = (e) => {
        const key = e.keyCode || e.charCode || 0;
        if (key === 27) {
            DropActions.selectDevice('');
            document.body.removeEventListener('keyup', this.handleKeysSelectedDevice);
        }
    };

    // show Device's id (above Device's icon) when user pressing 'Alt' key (press and hold)
    activateHover = (e) => {
        const key = e.keyCode || e.charCode || 0;
        if (key === 18) {
            e.preventDefault();
            this.setState({ hover: true });
        }
    };

    // remove showed Device's when user release 'Alt' key
    deactivateHover = () => {
        this.setState({ hover: false });
    };

    render() {
        const { hideSourceOnDrag, connectDropTarget } = this.props;
        const { devices, deviceTypes } = this.state;

        const deviceTypeStyle = {
            position: 'absolute',
            border: '1px ridge gray',
            padding: '0.5rem 1rem',
            cursor: 'move'
        };

        const styles = {
            position: 'relative',
            height: '100%',
            border: '1px solid black',
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, grey 0.5px, transparent 0.6px), linear-gradient(to bottom, grey 0.5px, transparent 0.6px)'
        };


        // add EventListener for showing Device's id
        if (devices.length != null) {
            document.body.addEventListener('keydown', this.activateHover);
            document.body.addEventListener('keyup', this.deactivateHover);
        } else {
            document.body.removeEventListener('keydown', this.activateHover);
            document.body.removeEventListener('keyup', this.deactivateHover);
        }

        const lines = [];
        const dropContainerElement = document.getElementById('drop-container');

        if (dropContainerElement != null) {
            lines.push(
                <line key={1} x1={dropContainerElement.offsetWidth - 100} y1={dropContainerElement.offsetHeight - 50} x2={dropContainerElement.offsetWidth - 50} y2={dropContainerElement.offsetHeight - 50} style={{ stroke: '#000000', strokeWidth: 2 }} />
            );
            lines.push(
                <line key={2} x1={dropContainerElement.offsetWidth - 100} y1={dropContainerElement.offsetHeight - 50} x2={dropContainerElement.offsetWidth - 100} y2={dropContainerElement.offsetHeight - 55} style={{ stroke: '#000000', strokeWidth: 2 }} />
            );
            lines.push(
                <line key={3} x1={dropContainerElement.offsetWidth - 50} y1={dropContainerElement.offsetHeight - 50} x2={dropContainerElement.offsetWidth - 50} y2={dropContainerElement.offsetHeight - 55} style={{ stroke: '#000000', strokeWidth: 2 }} />
            );
        }


        return connectDropTarget(
            <div id="drop-container" onClick={() => { DropActions.selectDevice(''); }} style={styles}>
                {devices.map(storedDevice => {
                    let tempLeft = 0;
                    let tempTop = 0;

                    // get location and draw arrow
                    if (storedDevice['geo:location']) {
                        const storedDeviceLocation = utils.getObjectFromGraphById(storedDevice['geo:location']['@id'], devices);

                        tempLeft = parseInt(storedDeviceLocation['geo:long']);
                        tempTop = parseInt(storedDeviceLocation['geo:lat']);

                        /* Draw arrow */
                        if (storedDevice['iot-lite:isSubSystemOf'] != null && storedDevice['iot-lite:isSubSystemOf']['@id'] != '') {
                            const targetDeviceId = storedDevice['iot-lite:isSubSystemOf']['@id'];
                            const targetDevice = utils.getObjectFromGraphById(targetDeviceId, devices);
                            const targetDeviceLocation = utils.getObjectFromGraphById(targetDevice['geo:location']['@id'], devices);
                            const targetLeft = parseInt(targetDeviceLocation['geo:long']);
                            const targetTop = parseInt(targetDeviceLocation['geo:lat']);
                            const sourceOffSetX = 25;
                            const sourceOffSetY = 25;
                            const targetOffSetX = 25;
                            const targetOffSetY = 25;
                            const pathX1 = tempLeft + sourceOffSetX;
                            const pathY1 = tempTop + sourceOffSetY;
                            const pathX2 = targetLeft + targetOffSetX;
                            const pathY2 = targetTop + targetOffSetY;
                            const pathMiddleX = (pathX2 - pathX1) / 2 + pathX1;
                            const pathMiddleY = (pathY2 - pathY1) / 2 + pathY1;
                            const pathCoordinates = `M${pathX1},${pathY1} L${pathMiddleX},${pathMiddleY} ` + `L${pathX2},${pathY2}`;
                            lines.push(
                                (
                                    <path key={storedDevice['@id']} d={pathCoordinates} markerMid={'url(#myAwesomeMarker)'} style={{ stroke: '#000000', strokeWidth: '2' }} />
                                )
                            );
                        }
                    }
                    const isSubClassOfSystem = utils.includesTypesInParentClasses('ssn:System', utils.getParentClasses(storedDevice['@type']));
                    
                    /*  Search for uses in isSubSystemOf, then add star */
                    let isSuperDevice = false;
                    devices.map((iterDevice) => {
                        if (iterDevice['iot-lite:isSubSystemOf'] && iterDevice['iot-lite:isSubSystemOf']['@id'] != iterDevice['@id'] && iterDevice['iot-lite:isSubSystemOf']['@id'] === storedDevice['@id']) { 
                            isSuperDevice = true; 
                        }
                    });

                    /* Render Devices into the DropContainer */
                    if (isSuperDevice && isSubClassOfSystem && this.state.hover) { 
                        return (
                            <div>
                                <div style={{ width: 150, textAlign: 'center', position: 'absolute', left: tempLeft - 50, top: tempTop - 20 }}>
                                    {storedDevice['@id'].replace(/(\w)*:/, '')}
                                </div>

                                <Device
                                    key={devices.indexOf(storedDevice)}
                                    id={storedDevice['@id']}
                                    left={tempLeft}
                                    top={tempTop}
                                    type={storedDevice['@type']}
                                    hideSourceOnDrag={hideSourceOnDrag}
                                />
                            </div>

                        ); 
                    } else if (isSubClassOfSystem && this.state.hover) {
                        return (
                            <div>
                                <div style={{ width: 150, textAlign: 'center', position: 'absolute', left: tempLeft - 50, top: tempTop - 20 }}>
                                    {storedDevice['@id'].replace(/(\w)*:/, '')}
                                </div>
                                <Device
                                    key={devices.indexOf(storedDevice)}
                                    id={storedDevice['@id']}
                                    left={tempLeft}
                                    top={tempTop}
                                    type={storedDevice['@type']}
                                    hideSourceOnDrag={hideSourceOnDrag}
                                />
                            </div>
                        ); 
                    } else if (isSubClassOfSystem) {
                        return (
                            <Device
                                key={devices.indexOf(storedDevice)}
                                id={storedDevice['@id']}
                                left={tempLeft}
                                top={tempTop}
                                type={storedDevice['@type']}
                                hideSourceOnDrag={hideSourceOnDrag}
                            />
                        ); 
                    }
                })}

                <svg height="100%" width="100%">
                    <defs>
                        <marker id={'myAwesomeMarker'} markerWidth={'13'} markerHeight={'13'} refX={'2'} refY={'6'} orient={'auto'} >
                            <path d={'M2,2 L2,11 L10,6 L2,2'} style={{ fill: '#000000' }} />
                        </marker>
                    </defs>
                    {lines}
                </svg>

                <div
                    style={{
                        position: 'absolute',
                        left: -3,
                        top: -3,
                        width: '6px',
                        height: '6px',
                        background: 'red',
                        borderRadius: '50px'
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        left: 5,
                        top: 5
                    }}
                >
                    (0,0)
                </div>

                <div
                    style={{
                        position: 'absolute',
                        left: dropContainerElement ? dropContainerElement.offsetWidth - 90 : 0,
                        top: dropContainerElement ? dropContainerElement.offsetHeight - 45 : 0
                    }}
                    className={(dropContainerElement ? '' : 'hidden')}
                >
                    25 cm
                </div>

            </div>
        );
    }
}


export default DropTarget(ItemTypes.BOX, boxTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))(DropContainer);
