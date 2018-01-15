import React from 'react';
import { List, ListItem } from 'material-ui/List';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Subheader from 'material-ui/Subheader';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import Divider from 'material-ui/Divider';
import DeviceStore from '../stores/DeviceStore';
import * as DropActions from '../actions/DropActions';
import * as utils from '../utils/utils';
import * as backend from '../backend/backend';

const subHeaderStyle = {
  fontSize: '20px',
  color: 'black'
};

export default class ComponentDetailList extends React.Component {
    constructor(props) {
        super(props);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.state = {
            devices: DeviceStore.getAllDevices(),
            left: 0,
            openSetProperty: false,
            selectValues: null,
            textValue: '',
            id: '',
            type: '',
            selectAttribute: '',
            selectedDevice: '',
            key: 0
        };
        this.isControlPressed = false;
    }

    componentWillMount() {
        DeviceStore.on('change', this.handleStateChange);
        document.body.addEventListener('keydown', this.handleControlDown);
        document.body.addEventListener('keyup', this.handleControlUp);
    }

    componentWillUnmount() {
        DeviceStore.removeListener('change', this.handleStateChange);
        document.body.removeEventListener('keydown', this.handleControlDown);
        document.body.removeEventListener('keyup', this.handleControlUp);
    }

    handleStateChange() {
        this.setState({
            devices: DeviceStore.getAllDevices(),
            selectedDevice: DeviceStore.getSelectedDevice()
        });
    }

    handleOpenSetProperty = () => {
        this.setState({ openSetProperty: true });
        DropActions.openSetProperty();
    };

    handleCloseSetProperty = () => {
      this.setState({ openSetProperty: false });
      if (utils.isPrimitiveProperty(this.state.selectAttribute)) {
          this.setState({ textValue: '' });
      } else {
          this.setState({ selectValues: null });
      }
      DropActions.closeSetProperty();
    };

    handleChange = (event, index, selectValues) => {
        this.setState({ selectValues, textValue: selectValues });
    };

    handleControlDown = (e) => {
      const key = e.keyCode || e.charCode || 0;

      if (key === 17) {
        this.isControlPressed = true;
      }
    };

    handleControlUp = (e) => {
        const key = e.keyCode || e.charCode || 0;
        if (key === 17) {
            this.isControlPressed = false;
        }
    };

    menuItems(selectValues) {
        if (!this.props.isPaletteItem) {
            let names = this.state.devices;

            // Filter out non-systems
            names = names.filter((iterDevice) => (
                utils.includesTypesInParentClasses('ssn:System', utils.getParentClasses(iterDevice['@type'])) && iterDevice['@id'] !== this.state.id
            ));

            // Filter out sensors and actors
            names = names.filter((iterDevice) => {
                const parentClasses = utils.getParentClasses(iterDevice['@type']);
                return !parentClasses.includes('iot-lite:ActuatingDevice') && !parentClasses.includes('ssn:SensingDevice');
            });

            names = names.map((iterDevice) => (iterDevice['@id']));
            let namesResult = [];
            namesResult.push(<MenuItem
                value={null}
                checked={selectValues && selectValues.includes(null)}
                primaryText={''}
            />);
            namesResult = backend.concatenate(namesResult, names.map((name) => (
                <MenuItem
                    key={name}
                    insertChildren
                    checked={selectValues && selectValues.includes(name)}
                    value={name}
                    primaryText={name.replace(/(.)*:/, '')}
                />
            )));
            return namesResult;
        }
    }


    render() {
        let selectedDevice;
        if (this.state.selectedDevice !== '') {
            selectedDevice = utils.getObjectFromGraphById(this.state.selectedDevice, this.state.devices);
        }
        if (selectedDevice != null) { 
            utils.cleanOutAttributes(['@type'], selectedDevice); 
        }
        const actionsSetProperty = [
            <FlatButton label="Cancel" onTouchTap={this.handleCloseSetProperty} />,
            <FlatButton
                label="Save" primary onTouchTap={() => {
                DropActions.setProperty(this.state.id, 
                    [this.state.selectAttribute], 
                    this.state.textValue, 
                    this.state.key
                );
                this.handleCloseSetProperty();
                this.state.textValue = '';  
            }}
            />
        ];
        const styles = {
            maxHeight: '100%',
            height: '100%',
            border: '1px solid black',
            overflow: 'auto',    // enable scrollable here
            backgroundColor: '#cfd8dc'
        };
        if (selectedDevice == null) {
            return (
                <div>
                    <MuiThemeProvider>
                        <div>
                            <List style={styles}>
                                <Subheader style={subHeaderStyle}>Details</Subheader>
                                <Divider />
                                <ListItem key={1} primaryText={'Select a Device or a Component'} />
                            </List>
                        </div>
                     </MuiThemeProvider>
                </div>
            );
        }
        /* The device is selected, so only the information about it is shown */
      
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <List style={styles}>
                            <Subheader style={subHeaderStyle}>
                                Details
                            </Subheader>
                            <Divider />
                            {Object.keys(selectedDevice).map(key => {
                                /* Array of objects as property value:
                                 * 1. Iterate through the objects in array
                                 * 2. If there are property values of the current object
                                 * (also objects), just the id is shown */
                                if (Array.isArray(selectedDevice[key])) {
                                    /* List-element for device attribute */
                                    return (<ListItem 
                                        key={key} primaryText={key.replace(/(.)*:/, '')} initiallyOpen={false} primaryTogglesNestedList={true} nestedItems={
                                        selectedDevice[key].map((lowerDevice, currIndex) => {
                                            if (typeof lowerDevice === 'object') {
                                            /* List-element for each lower device in array (pin) */
                                                return (<ListItem 
                                                    onClick={() => { if (this.isControlPressed && selectedDevice['@id'] !== lowerDevice['@id']) DropActions.selectDevice(lowerDevice['@id']); }} key={selectedDevice[key].indexOf(lowerDevice)} primaryText={lowerDevice['@id'].replace(/(.)*:/, '')} initiallyOpen={false} primaryTogglesNestedList={true} nestedItems={
                                                    // Sub-list-elements: traverse keys of lower device (pin)
                                                    Object.keys(lowerDevice).map((lowerKey) => {
                                                        if (lowerDevice[lowerKey]['@id'] != null) {
                                                            return (<ListItem 
                                                                onDoubleClick={() => {
                                                                if (lowerKey !== 'geo:location') {
                                                                    const tempDevice = utils.getObjectFromGraphById(selectedDevice['@id'], this.state.devices);
                                                                    this.setState({ id: tempDevice['@id'], type: tempDevice['@type'], selectAttribute: lowerKey });
                                                                    this.handleOpenSetProperty();
                                                                }
                                                            }} key={lowerKey} primaryText={`${lowerKey.replace(/(.)*:/, '')}: ${lowerDevice[lowerKey]['@id'].replace(/(.)*:/, '')}`}
                                                            />);
                                                        }  else {
                                                            return (<ListItem 
                                                                onDoubleClick={() => {
                                                                if (lowerKey !== 'geo:location') {
                                                                    const tempDevice = utils.getObjectFromGraphById(selectedDevice['@id'], this.state.devices);
                                                                    this.setState({ id: tempDevice['@id'], type: tempDevice['@type'], selectAttribute: lowerKey });
                                                                    this.handleOpenSetProperty();
                                                                }
                                                            }} 
                                                            key={lowerKey} primaryText={`${lowerKey.replace(/(.)*:/, '')}: ${lowerDevice[lowerKey].replace(/(.)*:/, '')}`}
                                                            />);
                                                        }
                                                    })
                                                }
                                                />);
                                            }
                                            /* When there is an array of primitive values as the attribute */
                                            else {
                                                return (<ListItem 
                                                    onDoubleClick={ () => {
                                                    if (key !== 'geo:location') {
                                                        const tempDevice = utils.getObjectFromGraphById(selectedDevice['@id'], this.state.devices);
                                                        this.setState({ id: tempDevice['@id'], type: tempDevice['@type'], selectAttribute: key, key: selectedDevice[key].indexOf(lowerDevice) });
                                                        this.handleOpenSetProperty();
                                                    }
                                                }}
                                                // show (currIndex + 1), so that index starts from 1
                                                key={currIndex} primaryText={`${currIndex + 1}: ${lowerDevice}`}
                                                />);
                                            }
                                        })
                                    }
                                    />);
                                    /* Object as property value:
                                     * if there are property values of this object
                                     * that are object as well, just the id is shown */
                                } else if (!Array.isArray(selectedDevice[key]) && typeof selectedDevice[key] === 'object' && selectedDevice[key]['@id'] != null) {
                                    if (key === 'geo:location') {
                                        const tempLocation = utils.getObjectFromGraphById(selectedDevice[key]['@id'], this.state.devices);
                                        return (
                                            <div>
                                            <ListItem key={'long'} primaryText={`x: ${tempLocation['geo:long']}`} />
                                            <ListItem key={'lat'} primaryText={`y: ${tempLocation['geo:lat']}`} />
                                            </div>
                                        );
                                    } 
                                    else {
                                        return (<ListItem
                                            onDoubleClick={() => {
                                                const tempDevice = utils.getObjectFromGraphById(selectedDevice['@id'], this.state.devices);
                                                this.setState({ id: tempDevice['@id'], type: tempDevice['@type'], selectAttribute: key });
                                                this.handleOpenSetProperty();
                                            }} 
                                            key={key} primaryText={`${key.replace(/(.)*:/, '')}: ${selectedDevice[key]['@id'].replace(/(.)*:/, '')}`} initiallyOpen={false} primaryTogglesNestedList={true}
                                        />);
                                    }
                                }
                                // Primitive data as property value
                                else if (typeof selectedDevice[key] === 'string') {
                                    return (<ListItem 
                                        onDoubleClick={ () => {
                                        if (key !== 'geo:location') {
                                            const tempDevice = utils.getObjectFromGraphById(selectedDevice['@id'], this.state.devices);
                                            this.setState({ id: tempDevice['@id'], type: tempDevice['@type'], selectAttribute: key });
                                            this.handleOpenSetProperty();
                                        }
                                    }}
                                    key={key} primaryText={`${key.replace(/(.)*:/, '')}: ${selectedDevice[key].replace(/(.)*:/, '')}`}
                                    />);
                                } 
                                return (<ListItem 
                                    onDoubleClick={ () => {
                                    if (key !== 'geo:location') {
                                        const tempDevice = utils.getObjectFromGraphById(selectedDevice['@id'], this.state.devices);
                                        this.setState({ id: tempDevice['@id'], type: tempDevice['@type'], selectAttribute: key });
                                        this.handleOpenSetProperty();
                                    }
                                }}
                                key={key} primaryText={`${key.replace(/(.)*:/, '')}: ${selectedDevice[key]}`}
                                />);
                            })}
                        </List>

                        <Dialog
                            title="Set Property"
                            actions={actionsSetProperty}
                            modal={false}
                            open={this.state.openSetProperty}
                            onRequestClose={this.handleCloseSetProperty}
                        >
                            {[1].map(
                                () => {
                                    if (utils.isPrimitiveProperty(this.state.selectAttribute)) {
                                        return (
                                            <TextField value={this.state.textValue} onChange={ (e) => {
                                                this.setState({ textValue: e.target.value }); 
                                            }} 
                                            hintText="New Value"
                                            />
                                        );
                                    } 
                                    return (
                                        <SelectField
                                            hintText="Select a device"
                                            value={this.state.selectValues}
                                            onChange={this.handleChange}
                                        >
                                            {this.menuItems(this.state.selectValues)}
                                        </SelectField>
                                    );
                                }
                            )}
                        </Dialog>
                        <h4>
                            <center>
                                <a href="dashboard.html#/app/mydevices">See more information</a>
                            </center>
                        </h4>
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }
}
