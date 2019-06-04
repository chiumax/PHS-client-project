/* global window.gapi */
import React from "react";
import { HotTable } from "@handsontable/react";
import logo from "../media/logo.svg";
const gapi = window.gapi;

export default class App extends React.Component {
  state = {
    url: "",
    profilePicture: "",
    profileName: "",
    classNew: "",
    dataNew: "",
    selectedRow: "",
    selectedColumn: "",
    data: undefined,
    header: [],
    verticalData: [],
    columns: [],
    authButtonClass: "buttonNone",
    signOutButtonClass: "buttonNone",
    oauthToken: undefined,
    currentFiles: [],
    libraries: "client:auth2:picker:drive-share",
    developerKey: "AIzaSyCVdNsIFlZ64SBTXLGzOokjqOJX0rH4z2o",
    appId: "527405108362",
    CLIENT_ID: window.credentials.clientID,
    API_KEY: window.credentials.apiKey,
    DISCOVERY_DOCS: [
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      "https://sheets.googleapis.com/$discovery/rest?version=v4"
    ],
    SCOPES:
      "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.appfolder https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.scripts https://www.googleapis.com/auth/drive.apps.readonly"
  };

  //---start setup---\\
  componentDidMount() {
    this.handleClientLoad();
  }
  handleClientLoad = () => {
    gapi.load(this.state.libraries, this.initClient);
  };

  initClient = () => {
    gapi.client
      .init({
        apiKey: this.state.API_KEY,
        clientId: this.state.CLIENT_ID,
        discoveryDocs: this.state.DISCOVERY_DOCS,
        scope: this.state.SCOPES
      })
      .then(
        () => {
          gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);
          this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        },
        error => {
          console.log(error);
        }
      );
  };

  updateSigninStatus = isSignedIn => {
    const user = gapi.auth2.getAuthInstance().currentUser.get();
    if (isSignedIn) {
      this.setState({
        authButtonClass: "buttonNone",
        signOutButtonClass: "buttonBlock",
        oauthToken: user.getAuthResponse().access_token,
        profilePicture: user.getBasicProfile().getImageUrl(),
        profileName: user.getBasicProfile().getName()
      });
      console.log("oauth: " + this.state.oauthToken);
    } else {
      this.setState({
        authButtonClass: "buttonBlock",
        signOutButtonClass: "buttonNone",
        profilePicture: "",
        profileName: ""
      });
    }
  };

  handleAuthClick = event => {
    gapi.auth2.getAuthInstance().signIn();
  };

  handleSignoutClick = event => {
    gapi.auth2.getAuthInstance().signOut();
  };
  //---end setup---\\

  //---begin new workspace functions---\\
  handleNewSheet = () => {
    //add sheet to current files
    console.log("handling");
    window.gapi.client.drive.files
      .copy({
        fileId: "1XSgNsTb2Bk5TTWcTfRyIv60_qw4UVHmQRPypak7WNoI",
        fields: "*",
        resource: {
          name: this.state.dataNew
        }
      })
      .then(response => {
        this.setState({ currentFiles: [response.result.id] });
        gapi.client.sheets.spreadsheets.values
          .get({ spreadsheetId: response.result.id, range: "Sheet1" })
          .then(response => {
            this.setState({ data: response.result.values });
          });
        console.log(response);
      });
  };

  //---end new workspace functions---\\

  //---begin picker functions---\\

  //Opens existing workspace
  handleOpenSheet = () => {
    console.log("handling");
    this.openPicker("application/vnd.google-apps.spreadsheet", this.handleOpenSheetCallback);
  };

  handleOpenSheetCallback = response => {
    console.log(response);
    if (response.action === window.google.picker.Action.PICKED) {
      const fileId = response.docs[0].id;
      console.log(fileId);
      //get columns
      gapi.client.sheets.spreadsheets.values
        .get({ spreadsheetId: fileId, range: "Sheet1", majorDimension: "COLUMNS" })
        .then(
          response => {
            this.setState({ verticalData: response.result.values }, () => {
              //get rows
              gapi.client.sheets.spreadsheets.values
                .get({ spreadsheetId: fileId, range: "Sheet1" })
                .then(response => {
                  console.log(response);
                  this.setState(
                    prevState => ({
                      currentFiles: [fileId, ...prevState.currentFiles],
                      data: response.result.values
                    }),
                    () => {
                      console.log(this.state.data);
                      this.handleDataParse();
                    }
                  );
                });
            });
          },
          error => {
            console.log(error);
          }
        );
    }
  };

  //Import sheet data. !Overwrites current data in sheet!
  handleImportSheet = () => {
    console.log("handling");
    this.openPicker("application/vnd.google-apps.spreadsheet", this.handleImportSheetCallback);
  };

  handleImportSheetCallback = response => {
    if (response.action === window.google.picker.Action.PICKED) {
      const fileId = response.docs[0].id;
      console.log(fileId);
      //get columns
      gapi.client.sheets.spreadsheets.values
        .get({ spreadsheetId: fileId, range: "Sheet1", majorDimension: "COLUMNS" })
        .then(response => {
          this.setState({ verticalData: response.result.values }, () => {
            //get rows
            gapi.client.sheets.spreadsheets.values
              .get({ spreadsheetId: fileId, range: "Sheet1" })
              .then(response => {
                console.log(response);
                this.setState(
                  prevState => ({
                    data: response.result.values
                  }),
                  () => {
                    this.handleSheetChange("Import file");
                    console.log(this.state.data);
                    this.handleDataParse();
                  }
                );
              });
          });
        });
    }
  };

  handleDataParse = () => {
    console.log(this.state.verticalData);
    // check if checkbox or dropdown
    let column = [];
    //header
    let row = [];
    //file ids to share
    let ids = [];
    let head = this.state.data[0];
    let arr = this.state.verticalData;
    for (let i = 0; i < head; i++) {
      if (head[i].indexOf("http") != -1 && head[i].lastIndexOf("/") != -1) {
        let id = head[i].slice(head[i].lastIndexOf("/") + 1);
        ids.push(id);
      } else {
        row.push(head[i]);
      }
    }
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][1] == "TRUE" || arr[i][1] == "FALSE") {
        column.push({
          type: "checkbox"
        });
      } else {
        let temp = arr[i];
        temp.shift();
        let returnVar = this.handleUnique(temp);
        if (Math.max(...returnVar[1]) > 3) {
          column.push({
            type: "dropdown",
            source: returnVar[0]
          });
        } else {
          column.push({});
        }
      }
    }
    this.setState({ column: column, header: this.state.data[0] });
    console.log(column);
  };

  //Given an array, returns an ordered list with unique vars and their corresponding frequencies
  handleUnique = arr => {
    var a = [],
      b = [],
      prev;

    arr.sort();
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] !== prev) {
        a.push(arr[i]);
        b.push(1);
      } else {
        b[b.length - 1]++;
      }
      prev = arr[i];
    }

    return [a, b];
  };

  //Add file to Sheet
  handleAddFile = () => {
    console.log("handling");
    this.openPicker("*", this.handleAddFileCallback);
  };

  handleAddFileCallback = response => {
    //add file to current files
    console.log(response);
    if (this.state.selectedRow == 0 && response.action === window.google.picker.Action.PICKED) {
      var arr = this.state.data.slice();
      var id = response.docs[0].id;
      let str = `<img src="https://drive.google.com/thumbnail?authuser=0&sz=w320&id=${id}"/>`;
      arr[0][this.state.selectedColumn] = str;
      this.setState(prevState => ({ data: arr }));
    }
  };

  openPicker = (type, callback) => {
    if (this.state.oauthToken) {
      var view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
      if (type != "*") {
        view.setMimeTypes(type);
      }
      var picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .setAppId(this.state.appId)
        .setOAuthToken(this.state.oauthToken)
        .addView(view)
        .addView(new window.google.picker.DocsUploadView())
        .setDeveloperKey(this.state.developerKey)
        .setCallback(callback)
        .build();
      picker.setVisible(true);
    }
  };

  //---end picker functions---\\

  //---share functions---\\
  handleShareWorkspace = () => {
    console.log(this.state.currentFiles);
    if (this.state.currentFiles.length >= 1) {
      console.log("handling");
      this.openShare();
    }
  };

  openShare = () => {
    var s = new window.gapi.drive.share.ShareClient();
    s.setOAuthToken(this.state.oauthToken);
    s.setItemIds(this.state.currentFiles);
    s.showSettingsDialog();
  };

  //---end share functions---\\

  //---spreadsheet functions---\\

  handleSheetChange = response => {
    console.log(response);
    console.log(this.state.data);
    if (this.state.currentFiles.length >= 1) {
      gapi.client.sheets.spreadsheets.values
        .update({
          spreadsheetId: this.state.currentFiles[0],
          range: "sheet1",
          values: this.state.data,
          valueInputOption: "USER_ENTERED"
        })
        .then(
          response => {
            console.log(response);
          },
          error => {
            console.log(error);
          }
        );
    }
  };

  handleSheetSelection = (r, c) => {
    console.log(r, c);
    this.setState({
      selectedRow: r,
      selectedColumn: c
    });
  };

  //---end spreadsheet functions---\\

  //---handle modal stuff and inputs---\\

  handleOpenModal = modal => {
    this.setState({ [`class${modal}`]: "is-active" });
  };
  handleCloseModal = modal => {
    this.setState({ [`class${modal}`]: "", [`data${modal}`]: "" });
  };

  handleInputChange = (event, modal) => {
    this.setState({ [`data${modal}`]: event.target.value });
  };

  //---end modal stuff and inputs---\\

  render() {
    return (
      <div className="App">
        <header>
          <img src={this.state.url} className="App-logo" alt="logo" />

          <div
            className={`g-sign-in-button ${this.state.authButtonClass}`}
            onClick={() => {
              this.handleAuthClick();
            }}
          >
            <div className="content-wrapper">
              <div className="logo-wrapper">
                <img src="https://developers.google.com/identity/images/g-logo.png" />
              </div>
              <span className="text-container">
                <span>Sign in with Google</span>
              </span>
            </div>
          </div>
          <div
            className={`g-sign-in-button ${this.state.signOutButtonClass}`}
            onClick={() => {
              this.handleSignoutClick();
            }}
          >
            <div className="content-wrapper">
              <div className="logo-wrapper">
                <img src="https://developers.google.com/identity/images/g-logo.png" />
              </div>
              <span className="text-container">
                <span>Sign Out</span>
              </span>
            </div>
          </div>
          <img src={this.state.profilePicture} />
          <div>{`Welcome back, ${this.state.profileName}`}</div>
          <button
            className=" button is-primary"
            onClick={() => {
              this.handleShareWorkspace();
            }}
          >
            share current workspace
          </button>
          <button
            className="button is-primary"
            onClick={() => {
              this.handleOpenSheet();
            }}
          >
            open spreadsheet
          </button>
          <button
            className=" button is-primary"
            onClick={() => {
              this.handleImportSheet();
            }}
          >
            import sheet
          </button>
          <button
            className=" button is-primary"
            onClick={() => {
              this.handleAddFile();
            }}
          >
            add file
          </button>

          <HotTable
            afterChange={change => {
              this.handleSheetChange(change);
            }}
            afterSelection={(r, c) => {
              this.handleSheetSelection(r, c);
            }}
            data={this.state.data == undefined ? undefined : this.state.data.slice(1)}
            colHeaders={true}
            rowHeaders={true}
            width="600"
            columns={this.state.column}
            height="300"
            colHeaders={this.state.header}
            settings={{
              stretchH: "all",
              width: 880,
              autoWrapRow: true,
              height: 487,
              manualRowResize: true,
              manualColumnResize: true,
              rowHeaders: true,
              manualRowMove: true,
              manualColumnMove: true,
              contextMenu: true,

              dropdownMenu: true,
              columnSorting: {
                indicator: true
              },
              autoColumnSize: {
                samplingRatio: 23
              },
              licenseKey: "non-commercial-and-evaluation"
            }}
          />
        </header>
        <button
          className="button is-link"
          onClick={() => {
            this.handleOpenModal("New");
          }}
        >
          Create New
        </button>
        <div className={`modal ${this.state.classNew}`}>
          <div className="modal-background" />
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">New Workspace</p>
              <button
                className="delete"
                aria-label="close"
                onClick={() => {
                  this.handleCloseModal("New");
                }}
              />
            </header>
            <section className="modal-card-body">
              <input
                className="input"
                type="text"
                placeholder="Name of Workspace"
                value={this.state.dataNew}
                onChange={event => {
                  this.handleInputChange(event, "New");
                }}
              />
            </section>
            <footer className="modal-card-foot">
              <button
                className="button is-success"
                onClick={() => {
                  this.handleCloseModal("New");
                  this.handleNewSheet();
                }}
              >
                Create
              </button>
              <button
                className="button"
                onClick={() => {
                  this.handleCloseModal("New");
                }}
              >
                Cancel
              </button>
            </footer>
          </div>
        </div>
      </div>
    );
  }
}
//uniq = [...new Set(array)];
//.map
//https://docs.google.com/spreadsheets/d/1H7U9DOdND02G_zxuISeYKsyQhm8erjwLgRimcWaud7U/edit#gid=0
