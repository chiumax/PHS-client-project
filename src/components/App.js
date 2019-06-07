/* global window.gapi */
import React from "react";
import { HotTable } from "@handsontable/react";
import logo from "../media/logo.svg";
import Calendar from "react-calendar";
const gapi = window.gapi;

export default class App extends React.Component {
  state = {
    url: "",
    profilePicture: "",
    profileName: "",
    classNew: "",
    dataNew: "",
    classDrop: "",
    dataDrop: "",
    classHead: "",
    dataHead: "",
    selectedRow: "",
    selectedColumn: "",
    data: [],
    date: new Date(),
    x: "40%",
    y: "40vh",
    calClass: "calGone",
    header: [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y"
    ],
    verticalData: [],
    columns: [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y"
    ],
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
    } else {
      this.setState({
        authButtonClass: "buttonBlock",
        signOutButtonClass: "buttonNone",
        profilePicture: "",
        profileName: ""
      });
    }
  };

  getData = () => {};
  handleAuthClick = event => {
    gapi.auth2.getAuthInstance().signIn();
  };

  handleSignoutClick = event => {
    this.setState(
      {
        currentFiles: []
      },
      () => {
        gapi.auth2.getAuthInstance().signOut();
      }
    );
  };
  //---end setup---\\

  //---begin new workspace functions---\\
  handleNewSheet = () => {
    //add sheet to current files
    //1XSgNsTb2Bk5TTWcTfRyIv60_qw4UVHmQRPypak7WNoI

    //19jsiHiwIITp2J1Mxum56oHMkumKQtTbG5WGQ72rrYv8
    window.gapi.client.drive.files
      .copy({
        fileId: "1WvzRzUM8Wq295r29kXJaToYmOpO1gmHU-hhk4gpF02c",
        fields: "*",
        resource: {
          name: this.state.dataNew
        }
      })
      .then(response => {
        console.log("copied");
        console.log(response);
        this.handleGetData(response.result.id);
      });
  };

  //---end new workspace functions---\\

  //---begin picker functions---\\

  //Opens existing workspace
  handleOpenSheet = () => {
    this.openPicker("application/vnd.google-apps.spreadsheet", this.handleOpenSheetCallback);
  };

  handleOpenSheetCallback = response => {
    if (response.action === window.google.picker.Action.PICKED) {
      const fileId = response.docs[0].id;
      this.handleGetData(fileId);
    }
  };

  handleGetData = fileId => {
    gapi.client.sheets.spreadsheets.values
      .get({ spreadsheetId: fileId, range: "Sheet1", majorDimension: "COLUMNS" })
      .then(response => {
        this.setState({ verticalData: response.result.values }, () => {
          gapi.client.sheets.spreadsheets.values
            .get({ spreadsheetId: fileId, range: "Sheet1" })
            .then(
              response => {
                this.setState(
                  {
                    currentFiles: [fileId],
                    data: response.result.values
                  },
                  () => {
                    this.handleDataParse();
                  }
                );
              },
              err => {
                console.log(err);
              }
            );
        });
      });
  };
  handleDataParse = () => {
    let column = [];
    let row = [];
    let ids = [];
    let head = this.state.data[0];
    let arr = this.state.verticalData;
    for (let i = 0; i < head.length; i++) {
      if (head[i].indexOf("http") != -1 && head[i].lastIndexOf("/") != -1) {
        let id = head[i].slice(head[i].lastIndexOf("/") + 1);
        ids.push(id);
        gapi.client.drive.files
          .get({
            fileId: id
          })
          .then(response => {
            let template = `<a target="_blank" rel="noopener noreferrer" href="https://drive.google.com/file/d/${id}" class="flexup">${
              response.result.name
            }<img src="https://drive.google.com/thumbnail?authuser=0&sz=w320&id=${id}"/></a>`;
            row.push(template);
          });
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
        if (Math.max(...returnVar[1]) > 5) {
          column.push({
            type: "dropdown",
            source: returnVar[0]
          });
        } else {
          column.push({});
        }
      }
    }
    this.setState(
      prevState => ({
        columns: column,
        header: row,
        currentFiles: [...prevState.currentFiles, ...ids]
      }),
      () => {}
    );
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
    if (this.state.selectedRow == 0) {
      this.openPicker("*", this.handleAddFileCallback);
    }
  };

  handleAddFileCallback = response => {
    //add file to current files
    if (this.state.selectedRow == 0 && response.action === window.google.picker.Action.PICKED) {
      var arr = this.state.data.slice();
      var head = this.state.header.slice();
      var id = response.docs[0].id;
      console.log(id);
      let str = `<a target="_blank" rel="noopener noreferrer" href="https://drive.google.com/file/d/${id}" class="flexup">${
        response.docs[0].name
      }<img src="https://drive.google.com/thumbnail?authuser=0&sz=w320&id=${id}"/></a>`;
      let cell = `https://drive.google.com/file/d/${id}`;
      arr[0][this.state.selectedColumn] = cell;
      head[this.state.selectedColumn] = str;
      this.setState(
        prevState => ({
          data: arr,
          header: head,
          currentFiles: [...prevState.currentFiles, id]
        }),
        () => {}
      );
    }
  };

  handleRemoveFile = () => {
    if (this.state.selectedRow == 0) {
      var arr = this.state.data.slice();
      var head = this.state.header.slice();
      var files = this.state.currentFiles.slice();

      var start = head[this.state.selectedColumn].indexOf("/d/") + 3;
      var end = head[this.state.selectedColumn].indexOf('"', start);
      var id = head[this.state.selectedColumn].toString().slice(start, end);

      arr[0][this.state.selectedColumn] = "Empty";
      head[this.state.selectedColumn] = "Empty"; //+4
      files.splice(files.indexOf(id), 1);

      this.setState(
        {
          data: arr,
          header: head,
          currentFiles: files
        },
        () => {}
      );
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
    if (this.state.currentFiles.length >= 1) {
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
    //for (let i = 0; i < response.length; i++) {}
    if (this.state.currentFiles.length >= 1) {
      gapi.client.sheets.spreadsheets.values
        .update({
          spreadsheetId: this.state.currentFiles[0],
          range: "Sheet1",
          values: this.state.data,
          valueInputOption: "USER_ENTERED"
        })
        .then(
          response => {},
          error => {
            console.log(error);
          }
        );
    }
  };

  handleSheetSelection = (r, c) => {
    this.setState({
      selectedRow: r,
      selectedColumn: c
    });
  };

  handleDropdown = () => {
    let arr = this.state.columns.slice();
    arr[this.state.selectedColumn] = {
      type: "dropdown",
      source: this.state.dataDrop.split(",")
    };
    this.setState({ columns: arr });
  };

  handleChangeHead = () => {
    let data = this.state.data.slice();
    let arr = this.state.header.slice();
    data[0][this.state.selectedColumn] = this.state.dataHead;
    arr[this.state.selectedColumn] = this.state.dataHead;
    this.setState({ header: arr, data: data });
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

  //---calendar stuff---\\
  calendarOnChange = date => {
    var arr = this.state.data.slice();
    arr[this.state.selectedRow + 1][this.state.selectedColumn] = `${date.getMonth() +
      1}/${date.getDate()}/${date.getFullYear()}`;
    this.setState({ date: date, calClass: "calGone", data: arr });
  };
  openCalendar = () => {
    this.setState({ calClass: "" });
  };
  mousePosition = e => {
    // if (this.state.calClass != "") {
    //   this.setState({
    //     x: e.screenX,
    //     y: e.screenY
    //   });
    // }
  };
  //---end calendar stuff---\\

  render() {
    return (
      <div
        className="App"
        onClick={e => {
          this.mousePosition(e);
        }}
      >
        <div
          className={`cal ${this.state.calClass}`}
          style={{ top: this.state.y, left: this.state.x }}
        >
          <Calendar
            onChange={date => {
              this.calendarOnChange(date);
            }}
            value={this.state.date}
          />
        </div>
        <nav className="navbar is-transparent">
          <div className="navbar-brand">
            <a className="navbar-item" href="">
              Student Data Organization
            </a>
            <div className="navbar-burger burger" data-target="navbarExampleTransparentExample">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div id="navbarExampleTransparentExample" className="navbar-menu">
            <div className="navbar-start">
              <a className="navbar-item" href="">
                Home
              </a>
              <div className="navbar-item has-dropdown is-hoverable">
                <a className="navbar-link" href="">
                  Docs
                </a>
                <div className="navbar-dropdown is-boxed">
                  <a className="navbar-item" href="">
                    Overview
                  </a>
                  <a className="navbar-item" href="">
                    Logging In
                  </a>
                  <a className="navbar-item" href="">
                    Features
                  </a>
                  <a className="navbar-item" href="">
                    Errors
                  </a>
                </div>
              </div>
            </div>

            <div className="navbar-end">
              <div className="navbar-item">
                <div className="field is-grouped">
                  <p className="control">
                    <div
                      className={`button ${this.state.authButtonClass}`}
                      onClick={() => {
                        this.handleAuthClick();
                      }}
                    >
                      <span className="icon">
                        <img src="https://developers.google.com/identity/images/g-logo.png" />
                      </span>
                      <span>Log In</span>
                    </div>
                  </p>
                  <p className={`control ${this.state.signOutButtonClass}`}>
                    <div
                      className="button"
                      onClick={() => {
                        this.handleSignoutClick();
                      }}
                    >
                      <span className="icon">
                        <img src="https://developers.google.com/identity/images/g-logo.png" />
                      </span>
                      <span>Log Out</span>
                    </div>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {this.state.authButtonClass == "buttonNone" ? (
          this.state.currentFiles.length != 0 ? (
            <div className={"App"}>
              <img src={this.state.profilePicture} />
              <div className={"title is-1"}>{`Welcome back, ${this.state.profileName}`}</div>
              <div className="columns">
                <div className="column">
                  <button
                    className=" button is-primary"
                    onClick={() => {
                      this.handleShareWorkspace();
                    }}
                  >
                    share current workspace
                  </button>
                </div>
                <div className="column">
                  <button
                    className="button is-primary"
                    onClick={() => {
                      this.handleOpenSheet();
                    }}
                  >
                    open spreadsheet
                  </button>
                </div>
                <div className="column">
                  <button
                    className="button is-link"
                    onClick={() => {
                      this.handleOpenModal("New");
                    }}
                  >
                    Create New
                  </button>
                </div>

                <div className="column">
                  <button
                    className=" button is-primary"
                    onClick={() => {
                      this.handleAddFile();
                    }}
                  >
                    add file
                  </button>
                </div>
                <div className="column">
                  <button
                    className=" button is-primary"
                    onClick={() => {
                      this.handleRemoveFile();
                    }}
                  >
                    Remove File
                  </button>
                </div>
              </div>

              <header
                className={"container restraint"}
                onClick={e => {
                  this.mousePosition(e);
                }}
              >
                <HotTable
                  afterChange={change => {
                    this.handleSheetChange(change);
                  }}
                  afterSelection={(r, c) => {
                    this.handleSheetSelection(r, c);
                  }}
                  contextMenu={{
                    callback: function(key, selection, clickEvent) {
                      // Common callback for all options
                    },
                    items: {
                      add_date: {
                        name: "Add Date",
                        callback: (key, selection, clickEvent) => {
                          this.openCalendar();
                        }
                      },
                      row_above: {},
                      row_below: {},
                      column_left: { name: "Insert Column Left" },
                      column_right: { name: "Insert Column Right" }
                    }
                  }}
                  dropdownMenu={{
                    callback: function(key, selection, clickEvent) {
                      // Common callback for all options
                    },
                    items: {
                      clear_format: {
                        name: "Clear Formatting",
                        callback: (key, selection, clickEvent) => {
                          let arr = this.state.columns;
                          arr[selection[0].start.toObject().col] = {};
                          this.setState({ columns: arr });
                        }
                      },
                      checkbox: {
                        name: "Add Checkboxes",
                        callback: (key, selection, clickEvent) => {
                          // Callback for specific option
                          let arr = this.state.columns;
                          arr[selection[0].start.toObject().col] = {
                            type: "checkbox"
                          };
                          this.setState({ columns: arr });
                        }
                      },
                      dropdown: {
                        name: "Add Dropdown",
                        callback: (key, selection, clickEvent) => {
                          this.handleOpenModal("Drop");
                        }
                      },

                      change_heading: {
                        name: "Change Heading Name",
                        callback: (key, selection, clickEvent) => {
                          this.handleOpenModal("Head");
                        }
                      }
                    }
                  }}
                  data={this.state.data.slice(1)}
                  colHeaders={true}
                  rowHeaders={true}
                  width="6000"
                  columns={this.state.columns}
                  height="700"
                  colHeaders={this.state.header}
                  settings={{
                    width: 880,
                    autoWrapRow: true,
                    height: 200,
                    manualRowResize: true,
                    manualColumnResize: true,
                    rowHeaders: true,
                    manualRowMove: true,
                    manualColumnMove: true,

                    startRows: 50,
                    startCols: 26,
                    colWidths: "100px",
                    autoColumnSize: {
                      samplingRatio: 23
                    },
                    licenseKey: "non-commercial-and-evaluation"
                  }}
                />
              </header>
            </div>
          ) : (
            <div className="columns">
              <div className="column">
                <button
                  className="button is-primary"
                  onClick={() => {
                    this.handleOpenSheet();
                  }}
                >
                  open spreadsheet
                </button>
              </div>
              <div className="column">
                <button
                  className="button is-link"
                  onClick={() => {
                    this.handleOpenModal("New");
                  }}
                >
                  Create New
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="App">
            <div className={"title is-1"}>Hello!</div>
            <div className={"title is-2"}>👋</div>
            <div className={"title is-2"}>Log in with your google account to start.</div>
          </div>
        )}
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
        <div className={`modal ${this.state.classDrop}`}>
          <div className="modal-background" />
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Dropdown Input</p>
              <button
                className="delete"
                aria-label="close"
                onClick={() => {
                  this.handleCloseModal("Drop");
                }}
              />
            </header>
            <section className="modal-card-body">
              <input
                className="input"
                type="text"
                placeholder="Dropdown List"
                value={this.state.dataDrop}
                onChange={event => {
                  this.handleInputChange(event, "Drop");
                }}
              />
            </section>
            <footer className="modal-card-foot">
              <button
                className="button is-success"
                onClick={() => {
                  this.handleCloseModal("Drop");
                  this.handleDropdown();
                }}
              >
                Create
              </button>
              <button
                className="button"
                onClick={() => {
                  this.handleCloseModal("Drop");
                }}
              >
                Cancel
              </button>
            </footer>
          </div>
        </div>
        <div className={`modal ${this.state.classHead}`}>
          <div className="modal-background" />
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">New Header Name</p>
              <button
                className="delete"
                aria-label="close"
                onClick={() => {
                  this.handleCloseModal("Head");
                }}
              />
            </header>
            <section className="modal-card-body">
              <input
                className="input"
                type="text"
                placeholder="Header Name"
                value={this.state.dataHead}
                onChange={event => {
                  this.handleInputChange(event, "Head");
                }}
              />
            </section>
            <footer className="modal-card-foot">
              <button
                className="button is-success"
                onClick={() => {
                  this.handleCloseModal("Head");
                  this.handleChangeHead();
                }}
              >
                Create
              </button>
              <button
                className="button"
                onClick={() => {
                  this.handleCloseModal("Head");
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
