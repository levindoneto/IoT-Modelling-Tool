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
import RaisedButton from 'material-ui/RaisedButton';


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


// "real" functions
function addDevice() {

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

  var response = "";

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
  var exportLink = document.getElementById("export-model");
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
      modelName: "",
      modeType: "",
      savedModels: [],
      saveButtonDisabled: true,
      errorText: null,
      snackBarSaveOpen: false
    };
  }


  // componentWillMount() {
  //   DeviceStore.on("change", this.getSavedModels);
  // }
  //
  //
  // componentWillUnmount() {
  //   DeviceStore.removeListener("change", this.getSavedModels);
  // }

  handleOpenSaveModel = () => {
   this.setState({openSaveModel: true});
  };

  handleCloseSaveModel = () => {
    this.setState({openSaveModel: false});
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

    handleCloseSnackBar = () => {
      this.setState({snackBarSaveOpen: false});
    };

/**
  handleKeysSaveModel = (e) => {
    var key = e.keyCode || e.charCode || 0;

    if (key == 13 && this.state.modelName != "") {
      DropActions.saveModel(this.state.modelName);

      this.handleCloseSaveModel();
      document.body.removeEventListener('keyup', this.handleKeysSaveModel);
    }
  };*/

  handleSaveModel = () => {
    let response = false;
    if (this.state.modelName != "") {
        //response = DropActions.saveModel(this.state.modelName);
        response = backend.fire_ajax_save(this.state.modelName, DeviceStore.getModel());
        console.log(response);
    }
    if (response === true) {
        this.setState({snackBarSaveOpen: true});
    } else {
        this.setState({snackBarSaveOpen: false});
    }
  };
  exportModel = () => {
    const tempDate = new Date();
    const file = new Blob(DeviceStore.getExport());
    var exportLink = document.getElementById("export-model");
    exportLink.href = URL.createObjectURL(file);
    exportLink.download = "iot_model_" + tempDate.getTime() + this.state.exportType;
    exportLink.click();
  };

  getSavedModels = () => {
    this.setState({savedModels: backend.fire_ajax_show().split("\n")});
  };

  /**
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
      <FlatButton
        label="Cancel"
        onTouchTap={this.handleCloseSaveModel}
      />,
      <FlatButton
        label="Save"
        primary={true}
        disabled={this.state.saveButtonDisabled}  // disable the button
        onTouchTap={ () => {this.handleSaveModel(); this.handleCloseSaveModel()} }
      />
    ];

    const actionsLoadModel = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseLoadModel}
      />
    ];

    const actionsExport = [
      <FlatButton
        label="Cancel"
        onTouchTap={this.handleCloseExport}
      />
    ];

    if (this.state.openSaveModel) {
      document.body.addEventListener('keyup', this.handleKeysSaveModel);
    }
    else {
      document.body.removeEventListener('keyup', this.handleKeysSaveModel);
    }


    return (
      <nav class="navbar navbar-default">
        <div class="container-fluid">
          <ul class="nav navbar-nav">
            <li><a href="#" onClick={this.handleOpenSaveModel}>Save Model</a></li>
            <li><a href="#" onClick={this.handleOpenLoadModel}>Load Model</a></li>
            <MuiThemeProvider>
              <div>
                <Dialog
                  id="dialog-save-model"
                  title="Save Model"
                  actions={actionsSaveModel}
                  modal={false}
                  open={this.state.openSaveModel}
                  onRequestClose={this.handleCloseSaveModel}

                >
                  <TextField value={this.state.modelName}
                             onChange={ (e) => this.setState({modelName: e.target.value}) }
                             hintText="Model's Name"
                             floatingLabelText="Enter Model's Name"
                             onBlur={this.isSaveButtonDisabled}   //check for emptiness of input here
                             errorText={this.state.errorText}
                  />
                </Dialog>
                <Snackbar
                    open={this.state.snackBarSaveOpen}
                    message="Saved successfully."
                    autoHideDuration={3000}
                    onRequestClose={this.handleCloseSnackBar}
                />

                <Dialog
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
                <Dialog
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
              </div>
            </MuiThemeProvider>
          </ul>
          <ul class="nav navbar-nav navbar-right">
            <li><a href="#" onClick={importModel}>Import Model</a></li>
            <input id="import-model" type="file" name="name" style={{display: 'none'}} onChange={readSingleFile} />
            <li><a href="#" onClick={this.handleOpenExport}>Export Model</a></li>
            <a id="export-model" href="" style={{display: 'none'}} download/>
          </ul>
        </div>
    </nav>
    );
  }
}
