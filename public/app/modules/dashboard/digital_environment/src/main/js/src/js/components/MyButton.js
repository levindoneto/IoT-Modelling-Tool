import React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';

import * as DeviceActions from "../actions/DropActions";
import DeviceStore from "../stores/DeviceStore";

const paletteContainerWidth = 155;
const paletteContainerHeight = 300;
const myListWidth = 205;
var myButtonHeight = 0;

const styles = {
  position: 'absolute',
  left:350,
  top: 310,

};


if ((window.innerWidth - paletteContainerWidth - myListWidth - 10) < window.innerHeight) {
  myButtonHeight = window.innerWidth - paletteContainerWidth - myListWidth - 10;
}
else {
  myButtonHeight = window.innerHeight - 100;
}

// styling for resizable window
// const styles = {
//   position: 'absolute',
//   left:window.innerWidth - paletteContainerWidth - myListWidth + 30,
//   top: window.innerWidth - paletteContainerWidth - myListWidth + 10,
//
// };

export default class MyButton extends React.Component {
    constructor() {
        super();
        this.getDevices = this.getDevices.bind(this);
        this.state = {
            todos: DeviceStore.getAllDevices(),
        };
    }

    componentWillMount() {
        DeviceStore.on("change", this.getDevices);
    }

    componentWillUnmount() {
        DeviceStore.removeListener("change", this.getDevices);
    }

    getDevices() {
        this.setState({
            todos: DeviceStore.getAllDevices()
        });
    }


	getBoxes() {
		alert(JSON.stringify(DeviceStore.getAllDevices()));
    // console.log(JSON.stringify(DeviceStore.getAllDevices()));
	}


    render() {
      return (
        <MuiThemeProvider>
          <RaisedButton label="Get Boxes" style={styles} onClick={this.getBoxes} primary={true} />
        </MuiThemeProvider>
      );
    }


}
