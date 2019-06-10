/* global window.gapi */
import React from "react";
import { HotTable } from "@handsontable/react";
import Calendar from "react-calendar";
const gapi = window.gapi;

export default class App extends React.Component {
  state = {
    settings: {},
    sheetSettings: {},
    authButtonClass: "buttonNone",
    signOutButtonClass: "buttonNone",
    oauthToken: undefined,
    profilePicture: "",
    profileName: "",
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

  commponentDidMount() {
    gapi.load(this.state.libraries, this.initClient);
  }

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

  handleAuthClick = event => {
    gapi.auth2.getAuthInstance().signIn();
  };

  handleSignoutClick = event => {
    //set this up for routes
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

  handleBrandNewSheet = () => {};
  handleNewSheet = () => {
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
    console.log(JSON.parse(this.state.data[0][0]));
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

  //---end calendar stuff---\\

  render() {}
}
