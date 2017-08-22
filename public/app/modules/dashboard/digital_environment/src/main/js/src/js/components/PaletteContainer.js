

import React, { Component, PropTypes } from 'react';
import { DropTarget, DragDropContext } from 'react-dnd';
import { List, ListItem } from 'material-ui/List';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Device from './Device';
import ItemTypes from '../dnd/ItemTypes';
import { definitions } from '../constants/definitions';
import * as utils from '../utils/utils';
import * as DropActions from '../actions/DropActions';

const paletteItemsStyles = {
    left: 5,
    top: 40
};

const styles = {
    height: '100%',
    width: '100%',
    border: '1px solid black',
    overflow: 'auto', // Enable scrollable here
};

const subHeaderStyle = {
    fontSize: '20px',
    color: 'black'
};


const boxTarget = {
    drop(props, monitor, component) {
    }
};

class PaletteContainer extends Component {
    static propTypes = {
        hideSourceOnDrag: PropTypes.bool.isRequired,
        connectDropTarget: PropTypes.func.isRequired
    };

    render() {
        const { hideSourceOnDrag, connectDropTarget } = this.props;
        const definitionsDevices = definitions['@graph'].filter((iterObject) => !['owl:Restriction', 'owl:ObjectProperty', 'owl:AnnotationProperty'].includes(iterObject['@type']));

        /* for key and y-value */
        let tempCount = -1;
        return connectDropTarget(
            <div style={styles}>
                <MuiThemeProvider>
                    <List>
                        <Subheader style={subHeaderStyle}>
                            Palette
                        </Subheader>
                        <Divider />
                        <Subheader>Devices</Subheader>
                        {definitionsDevices.map(iterDevice => {
                            let isDevice = false;
                            if (Array.isArray(iterDevice['rdfs:subClassOf'])) {
                                iterDevice['rdfs:subClassOf'].map((iterSubClass) => {
                                    if (iterSubClass['@id'] === 'ssn:Device') { // TODO: Change the ontologies
                                        isDevice = true;
                                    }
                                });
                            }

                            if (iterDevice['@id'].startsWith('ipvs:') && isDevice) { // TODO: Change the company's prefix
                                tempCount += 1;
                                DropActions.addDeviceType(iterDevice['@id']);
                                return (
                                    <Device
                                        class="col-sm-3" key={iterDevice['@id']}
                                        id={iterDevice['@id']}
                                        left={paletteItemsStyles.left}
                                        top={paletteItemsStyles.top * (tempCount)}
                                        type={iterDevice['@id']}
                                        isPaletteItem
                                        hideSourceOnDrag={hideSourceOnDrag}
                                    >
                                    </Device>
                                );
                            }
                        })}
                        <Subheader>Sensors</Subheader>
                        {definitionsDevices.map(
                            iterDevice => {
                                if (iterDevice['@id'].startsWith('ipvs:') && iterDevice['rdfs:subClassOf'] && utils.getParentClasses(iterDevice['@id']).includes('ssn:SensingDevice')) {
                                    tempCount += 1;
                                    DropActions.addDeviceType(iterDevice['@id']);

                                    return (
                                        <Device
                                            class="col-sm-3" key={iterDevice['@id']}
                                            id={iterDevice['@id']}
                                            left={paletteItemsStyles.left}
                                            top={paletteItemsStyles.top * (tempCount + 1)}
                                            type={iterDevice['@id']}
                                            isPaletteItem
                                            hideSourceOnDrag={hideSourceOnDrag}
                                        >
                                        </Device>
                                    );
                                }
                            }
                        )}
                        <Subheader>Actuators</Subheader>
                        {definitionsDevices.map(
                            iterDevice => {
                                if (iterDevice['@id'].startsWith('ipvs:') && iterDevice['rdfs:subClassOf'] && utils.getParentClasses(iterDevice['@id']).includes('iot-lite:ActuatingDevice')) {
                                    tempCount += 1;
                                    DropActions.addDeviceType(iterDevice['@id']);
                                    return (
                                        <Device
                                            class="col-sm-3" key={iterDevice['@id']}
                                            id={iterDevice['@id']}
                                            left={paletteItemsStyles.left}
                                            top={paletteItemsStyles.top * (tempCount + 1)}
                                            type={iterDevice['@id']}
                                            isPaletteItem
                                            hideSourceOnDrag={hideSourceOnDrag}
                                        >
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
