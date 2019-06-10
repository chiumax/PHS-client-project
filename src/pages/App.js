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
    sharedPeople: "",
    classNew: "",
    dataNew: "",
    classDrop: "",
    dataDrop: "",
    classHead: "",
    dataHead: "",
    selectedRow: "",
    selectedColumn: "",
    settings: {},
    sheetSettings: {},
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
    burger: "",
    currentFiles: [],
    libraries: window.credentials.libraries,
    developerKey: window.credentials.developerKey,
    appId: window.credentials.appId,
    CLIENT_ID: window.credentials.clientID,
    API_KEY: window.credentials.apiKey,
    DISCOVERY_DOCS: window.credentials.DISCOVERY_DOCS,
    SCOPES: window.credentials.SCOPES
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
          this.handleUpdateSheet();
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
    var name = this.state.dataNew;
    gapi.client.sheets.spreadsheets.create({}).then(response => {
      var id = response.result.spreadsheetId;
      console.log(response);
      console.log(this.state.dataNew);
      gapi.client.drive.files
        .update({
          fileId: response.result.spreadsheetId,
          resource: { name: name }
        })
        .then(response => {
          console.log(response);
        });
      gapi.client.sheets.spreadsheets.values
        .update({
          spreadsheetId: response.result.spreadsheetId,
          range: "Y49",
          values: [["."]],
          valueInputOption: "USER_ENTERED"
        })
        .then(() => {
          this.handleGetData(id);
        });
    });
    // window.gapi.client.drive.files
    //   .copy({
    //     fileId: "1WvzRzUM8Wq295r29kXJaToYmOpO1gmHU-hhk4gpF02c",
    //     fields: "*",
    //     resource: {
    //       name: this.state.dataNew
    //     }
    //   })
    //   .then(response => {
    //     console.log("copied");
    //     console.log(response);
    //     this.handleGetData(response.result.id);
    //   });
  };

  //---end new workspace functions---\\

  //---begin picker functions---\\

  //Opens existing workspace

  handleUpdateSheet = () => {
    if (this.state.currentFiles.length != 0) {
      this.handleGetData(this.state.currentFiles[0]);
    }
    setTimeout(this.handleUpdateSheet, 10000);
  };
  handleOpenSheet = () => {
    this.openPicker("application/vnd.google-apps.spreadsheet", this.handleOpenSheetCallback);
  };

  handleOpenSheetCallback = response => {
    if (response.action === window.google.picker.Action.PICKED) {
      const fileId = response.docs[0].id;
      gapi.client.sheets.spreadsheets.values
        .update({
          spreadsheetId: fileId,
          range: "Y49",
          values: [["."]],
          valueInputOption: "USER_ENTERED"
        })
        .then(() => {
          this.handleGetData(fileId);
        });
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
                console.log(response);
                this.setState(
                  {
                    currentFiles: [fileId],
                    data: response.result.values
                  },
                  () => {
                    gapi.client.drive.files
                      .get({
                        fileId: this.state.currentFiles[0],
                        fields: "*"
                      })
                      .then(response => {
                        let people = response.result.permissions;
                        people = people.map(elm => {
                          return elm.emailAddress;
                        });
                        console.log(people);
                        this.setState({ sharedPeople: people }, () => {
                          this.handleDataParse();
                        });
                      });
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
    try {
      console.log(JSON.parse(this.state.data[0][0]));
    } catch (err) {
      console.log(err);
    }

    let arr = this.state.verticalData;
    var j = 0;
    for (let i = 0; i < head.length; i++) {
      if (head[i].indexOf("link") != -1) {
        let items = head[i].split(" ");
        let id = items[2];
        ids.push(id);

        let template = `<a target="_blank" rel="noopener noreferrer" href="https://drive.google.com/file/d/${id}" class="flexup">${
          items[1]
        }<img src="https://drive.google.com/thumbnail?authuser=0&sz=w320&id=${id}"/></a>`;

        row.push(template);
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
      setTimeout(() => {
        for (let i = 0; i < this.state.sharedPeople.length; i++) {
          gapi.client.drive.permissions
            .create({
              fileId: id,
              resource: { role: "writer", type: "user", emailAddress: this.state.sharedPeople[i] }
            })
            .then(response => {
              console.log(response);
            });
        }
      }, 20000);

      console.log(id);
      let str = `<a target="_blank" rel="noopener noreferrer" href="https://drive.google.com/file/d/${id}" class="flexup">${
        response.docs[0].name
      }<img src="https://drive.google.com/thumbnail?authuser=0&sz=w320&id=${id}"/></a>`;
      let cell = `https://drive.google.com/file/d/${id}`;
      arr[0][this.state.selectedColumn] = "link " + response.docs[0].name + " " + id;
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
    // gapi.client.drive.permissions.list({ fileId: id, fields: "*" }).then(response => {
    //   for (let i = 0; i < response.permissions; i++) {
    //     if (permissions[i].role != "owner") {
    //       gapi.client.drive.permissions.update({
    //         fileId: id,
    //         resource: { role: "writer", type: "user", emailAddress: this.state.sharedPeople[i] }
    //       });
    //     }
    //   }
    // });
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
    this.setState({ [`data${modal}`]: event.target.value }, () => {
      console.log(this.state.dataNew);
    });
  };

  //---end modal stuff and inputs---\\

  //---calendar stuff---\\
  calendarOnChange = date => {
    // don't set it

    var arr = this.state.data.slice();
    arr[this.state.selectedRow + 1][this.state.selectedColumn] = `${date.getMonth() +
      1}/${date.getDate()}/${date.getFullYear()}`;
    this.setState({ date: date, calClass: "calGone", data: arr });
  };
  openCalendar = () => {
    this.setState({ calClass: "" });
  };

  toggleBurger = () => {
    this.setState(prevState => ({ burger: !!prevState.burger ? "" : "is-active" }));
  };
  //---end calendar stuff---\\

  render() {
    return (
      <div className="App">
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
            <div
              className={`navbar-burger burger ${this.state.burger}`}
              data-target="navbarExampleTransparentExample"
              onClick={() => {
                this.toggleBurger();
              }}
            >
              <span />
              <span />
              <span />
            </div>
          </div>

          <div id="navbarExampleTransparentExample" className={`navbar-menu ${this.state.burger}`}>
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

              <header className={"container restraint"}>
                <HotTable
                  settings={{
                    afterSelection: (r, c) => {
                      this.handleSheetSelection(r, c);
                    },
                    dropdownMenu: {
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
                    },
                    contextMenu: {
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
                        row_above: {
                          name: "Insert Row Above",
                          callback: (key, selection, clickEvent) => {
                            let arr = this.state.data.slice();
                            arr.splice(selection[0].start.toObject().row, 0, []);
                            this.setState({ data: arr });
                          }
                        },
                        row_below: {
                          name: "Insert Row Below",
                          callback: (key, selection, clickEvent) => {}
                        },
                        column_left: { name: "Insert Column Left" },
                        column_right: { name: "Insert Column Right" }
                      }
                    },
                    colHeaders: true,
                    rowHeaders: true,
                    height: "700",
                    afterChange: change => {
                      this.handleSheetChange(change);
                    },
                    data: this.state.data.slice(1),
                    columns: this.state.columns,
                    colHeaders: this.state.header,
                    autoWrapRow: true,
                    manualRowResize: true,
                    manualColumnResize: true,
                    rowHeaders: true,
                    fixedColumnsLeft: 2,
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
            <div>
              <img src={this.state.profilePicture} />
              <div className={"title is-1"}>{`Welcome back, ${this.state.profileName}`}</div>
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
