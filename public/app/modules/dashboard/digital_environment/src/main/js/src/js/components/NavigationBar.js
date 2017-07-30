import * as backend from '../backend/backend';
import DeviceStore from "../stores/DeviceStore";
import Dialog from 'material-ui/Dialog';
import * as DropActions from '../actions/DropActions';
import FlatButton from 'material-ui/FlatButton';
import { List, ListItem } from 'material-ui/List';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import React from "react";
import TextField from 'material-ui/TextField';
import Snackbar from 'material-ui/Snackbar';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import {Toolbar, ToolbarGroup, ToolbarSeparator} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';



const style = {
  display: 'inline-block',
  float: 'left',
  // margin: '16px 32px 16px 0',
};

const subHeaderStyle = {
  fontSize: '20px',
  color: 'black'
}


// "helper" functions
function readSingleFile(e) {
  const file = e.target.files[0];
  const fileEnding = e.target.value.match(new RegExp("\\..*"))[0];


  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {

    const contents = e.target.result;

    switch (fileEnding) {
      case ".rdf":
        backend.fire_ajax_import("rdfxml", contents);
        break;

      case ".ttl":
        backend.fire_ajax_import("turtle", contents);
        break;

      default:
        DropActions.importModel(JSON.parse(contents));
    }

  };
  reader.readAsText(file);
}


function loadModel(key) {
  key = key.match(new RegExp("\.+\\."))[0];

  key = key.substring(0, key.length - 1);

  DropActions.loadModel(key);
}

function importModel() {
  document.getElementById('import-model').click();
}

function exportModel(exportType) {

  let response = "";

  switch (exportType) {
    case ".ttl":
      response = backend.fire_ajax_export("turtle", DeviceStore.getModel());
      break;

    case ".rdf":
      response = backend.fire_ajax_export("rdfxml", DeviceStore.getModel());
      break;

    default:
      response = JSON.stringify(DeviceStore.getModel());
  }


  const tempDate = new Date();
  const file = new Blob([response]);
  const exportLink = document.getElementById("export-model");
  exportLink.href = URL.createObjectURL(file);
  exportLink.download = "iot_model_" + tempDate.getTime() + exportType;
  exportLink.click();
}


export default class NavigationBar extends React.Component {

  constructor(props) {
    super(props);
    this.exportModel = this.exportModel.bind(this);
    this.state = {
      openSaveModel: false,
      openLoadModel: false,
      openExport: false,
      openHelp: false,
      modelName: "",
      modeType: "",
      savedModels: [],
      saveButtonDisabled: true,
      errorText: null,
      snackBarSaveOpen: false
    };
  }


  handleOpenSaveModel = () => {
   this.setState({openSaveModel: true});
  };

  handleCloseSaveModel = () => {
    this.setState({
      openSaveModel: false,
      saveButtonDisabled: true,
      errorText: null,
      modelName: ""
    });
  };

  handleOpenLoadModel = () => {
    this.getSavedModels();
    this.setState({openLoadModel: true});
  };

  handleCloseLoadModel = () => {
    this.setState({openLoadModel: false});
  };

  handleOpenExport = () => {
   this.setState({openExport: true});
  };

  handleCloseExport = () => {
    this.setState({openExport: false});
  };

  handleOpenHelp = () => {
   this.setState({openHelp: true});
  };

  handleCloseHelp = () => {
    this.setState({openHelp: false});
  }

  handleCloseSnackBar = () => {
    this.setState({snackBarSaveOpen: false});
  };

  handleSaveModel = () => {
    let response = false;
    if (this.state.modelName != "") {
        //response = DropActions.saveModel(this.state.modelName);
        response = backend.fire_ajax_save(this.state.modelName, DeviceStore.getModel());

    }
    if (response === true) {
        this.setState({snackBarSaveOpen: true});
    } else {
        this.setState({snackBarSaveOpen: false});
    }
  };

  /*
    Method to handle export action:
    Front-end receive the model from back-end, then write it into a file and download to user
   */
  exportModel = () => {
    const tempDate = new Date();
    const file = new Blob(DeviceStore.getExport());
    const exportLink = document.getElementById("export-model");
    exportLink.href = URL.createObjectURL(file);
    exportLink.download = "iot_model_" + tempDate.getTime() + this.state.exportType;
    exportLink.click();
  };

  getSavedModels = () => {
    const tempSavedModels = backend.fire_ajax_show().split("\n");
    const tempSavedModelsFiltered = tempSavedModels.filter((iterModel) => (iterModel != ""))
    this.setState({savedModels: tempSavedModelsFiltered});
  };

  /*
    Method to check if the input field in 'save model' is empty or not,
    respectively disables the save button or not
   */
  isSaveButtonDisabled = () => {
    if (this.state.modelName === "") {
        this.setState({saveButtonDisabled: true});
        this.setState({errorText: "Model's name can not be empty!"});
    } else {
        this.setState({saveButtonDisabled: false});
        this.setState({errorText: null});
    }
  };





  render() {

    const actionsSaveModel = [
      <FlatButton label="Cancel" onTouchTap={this.handleCloseSaveModel} />  ,
      <FlatButton label="Save" primary={true} disabled={this.state.saveButtonDisabled}  // disable the button
        onTouchTap={ () => {this.handleSaveModel(); this.handleCloseSaveModel()} }  />
    ];

    const actionsLoadModel = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseLoadModel} />
    ];

    const actionsExport = [
      <FlatButton label="Cancel" onTouchTap={this.handleCloseExport} />
    ];

    const actionsHelp = [
      <FlatButton label="Close" onTouchTap={this.handleCloseHelp} />
    ];

    if (this.state.openSaveModel) {
      document.body.addEventListener('keyup', this.handleKeysSaveModel);
    }
    else {
      document.body.removeEventListener('keyup', this.handleKeysSaveModel);
    }

    return (
      <MuiThemeProvider>
        <div>

          <Toolbar>
            <ToolbarGroup firstChild={true}>
              <RaisedButton label="Save Model" onClick={this.handleOpenSaveModel} primary={true} />
              <RaisedButton label="Load Model" onClick={this.handleOpenLoadModel} primary={true} />
              <RaisedButton label="Export Model" onClick={this.handleOpenExport} primary={true} />
              <RaisedButton label="Import Model" onClick={importModel} primary={true} />
              <RaisedButton label="Clear" onClick={DropActions.clearDevices} secondary={true} />
            </ToolbarGroup>

            <ToolbarGroup>
              <ToolbarSeparator />
              <RaisedButton label="Help" onClick={this.handleOpenHelp} primary={true} />
            </ToolbarGroup>
          </Toolbar>


          <Dialog         // Dialog for save action
            id="dialog-save-model"
            title="Save Model"
            actions={actionsSaveModel}
            modal={false}
            open={this.state.openSaveModel}
            onRequestClose={this.handleCloseSaveModel}

          >
            <TextField       // Text field for entering model's name in save action
                value={this.state.modelName}
                 onChange={ (e) => {
                   this.setState({modelName: e.target.value});
                 } }
                 hintText="Model's Name"
                 floatingLabelText="Enter Model's Name"
                 onBlur={this.isSaveButtonDisabled}   //check for emptiness of input here
                 errorText={this.state.errorText}
            />
          </Dialog>

          <Snackbar         // Dialog for confirming a successful save
              open={this.state.snackBarSaveOpen}
              message="Saved successfully."
              autoHideDuration={3000}
              onRequestClose={this.handleCloseSnackBar}
          />

          <Dialog       // Dialog for load action
            title="Load Model"
            actions={actionsLoadModel}
            modal={false}
            open={this.state.openLoadModel}
            autoScrollBodyContent={true}    // enable scrollable here
            onRequestClose={this.handleCloseLoadModel}
          >
            <List>
              { this.state.savedModels.map(model => {

                  return (
                    <ListItem onClick={ (e) => { loadModel(model); this.handleCloseLoadModel()} }
                              key={this.state.savedModels.indexOf(model)}
                              primaryText={model} />
                  );
                })
              }
            </List>
          </Dialog>

          <Dialog      // Dialog for export action
            title="Export Model"
            actions={actionsExport}
            modal={false}
            open={this.state.openExport}
            onRequestClose={this.handleCloseExport}
          >
            Please choose a format to export the model:
            <List>
              <ListItem onClick={ () => { exportModel(".rdf"); this.handleCloseExport() }} primaryText="rdf/xml" />
              <ListItem onClick={ () => { exportModel(".jsonld"); this.handleCloseExport() }} primaryText="json-ld" />
              <ListItem onClick={ () => { exportModel(".ttl"); this.handleCloseExport() }} primaryText="turtle" />
            </List>
          </Dialog>


          <Dialog       // Dialog for help
            title="Help"
            actions={actionsHelp}
            modal={false}
            open={this.state.openHelp}
            onRequestClose={this.handleCloseHelp}
            autoScrollBodyContent={true}
          >

            <Paper style={style} >
                  <Menu desktop={true} width={512} >

                    <Subheader style={subHeaderStyle}>Buttons</Subheader>
                    <Divider />
                    <MenuItem primaryText="Save Model"       secondaryText="Save Created Model" />
                    <MenuItem primaryText="Load Model"       secondaryText="Load Previously Saved Model" />
                    <MenuItem primaryText="Export Model"     secondaryText="Export Model" />
                    <MenuItem primaryText="Import Model"     secondaryText="Import Model" />
                    <MenuItem primaryText="Clear"            secondaryText="Clear Drop Zone" />
                    <Subheader style={subHeaderStyle}>Mouse Commands</Subheader>
                    <Divider />
                    <MenuItem primaryText="Create Device"    secondaryText="Drag Device From The 'Palette' To Grid Zone" />
                    <MenuItem primaryText="Create Subdevice" secondaryText="Drag Subdevice Onto Other Device" />
                    <MenuItem primaryText="Select Device"    secondaryText="Click On Device" />
                    <MenuItem primaryText="Unselect Device"  secondaryText="Click Outside Of Device" />
                    <Divider />
                    <Subheader style={subHeaderStyle}>Key Commands</Subheader>
                    <Divider />
                    <MenuItem primaryText="Unselect Device"  secondaryText="ESC" />
                    <MenuItem primaryText="Delete Device"    secondaryText="DEL" />
                    <MenuItem primaryText="Commit Dialog"    secondaryText="Enter" />
                    <MenuItem primaryText="Close Dialog"     secondaryText="ESC" />
                  </Menu>
                </Paper>
          </Dialog>
          <input id="import-model" type="file" name="name" style={{display: 'none'}} onChange={readSingleFile} />
          <a id="export-model" href="" style={{display: 'none'}} download/>
        </div>

      </MuiThemeProvider>

    );
  }
}
