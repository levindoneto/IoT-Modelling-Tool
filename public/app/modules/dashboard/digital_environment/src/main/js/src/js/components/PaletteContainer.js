import Device from './Device';
import { DropTarget, DragDropContext } from 'react-dnd';
import ItemTypes from '../dnd/ItemTypes';
import React, { Component, PropTypes } from 'react';
import { List, ListItem } from 'material-ui/List';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import { definitions } from '../constants/definitions';
import * as utils from '../utils/utils';
import * as DropActions from '../actions/DropActions';


const paletteItemsStyles = {
  left: 5,
  top: 40
};

const styles = {
  height: '100%',
  border: '1px solid black',
  overflow: 'auto', // enable scrollable here
};

const subHeaderStyle = {
  fontSize: '20px',
  color: 'black'
}


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


  render() {
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
            <Subheader style={subHeaderStyle}>Palette</Subheader>
            <Divider/>
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

                  DropActions.addDeviceType(iterDevice["@id"]);

                  return (

                      <Device class="col-sm-3" key={iterDevice["@id"]}
                           id={iterDevice["@id"]}
                           left={paletteItemsStyles.left}
                           top={paletteItemsStyles.top * (tempCount)}
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

                      DropActions.addDeviceType(iterDevice["@id"]);

                      return (
                          <Device class="col-sm-3" key={iterDevice["@id"]}
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
            <Subheader>Actors</Subheader>
              {definitionsDevices.map(
                  iterDevice => {
                    if ( iterDevice["@id"].startsWith("ipvs:") && iterDevice["rdfs:subClassOf"] && utils.getParentClasses(iterDevice["@id"]).includes("iot-lite:ActuatingDevice") ) {
                      tempCount = tempCount + 1;

                      DropActions.addDeviceType(iterDevice["@id"]);

                      return (
                          <Device class="col-sm-3" key={iterDevice["@id"]}
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
