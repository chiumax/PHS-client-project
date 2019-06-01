/* global window.gapi */
import React from "react";
import logo from "../media/logo.svg";
//import * as credentials from "./credentials.js";

export default class App extends React.Component {
  state = { url: "", CLIENT_ID: window.credentials.clientID, API_KEY: window.credentials.apiKey, DICOVERY_DOCS:["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],SCOPES: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.appfolder https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.scripts https://www.googleapis.com/auth/drive.apps.readonly" };
  componentDidMount() {
    var CLIENT_ID = window.credentials.clientID;
    var API_KEY = window.credentials.apiKey;

    // Array of API discovery doc URLs for APIs used by the quickstart
    var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    var SCOPES =
      "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.appfolder https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.scripts https://www.googleapis.com/auth/drive.apps.readonly";

    var authorizeButton = document.getElementById("authorize_button");
    var signoutButton = document.getElementById("signout_button");
    handleClientLoad();
    // The Browser API key obtained from the Google API Console.
    // Replace with your own Browser API key, or your own key.
    var developerKey = "AIzaSyCVdNsIFlZ64SBTXLGzOokjqOJX0rH4z2o";

    // Replace with your own project number from console.developers.google.com.
    // See "Project number" under "IAM & Admin" > "Settings"
    var appId = "527405108362";

    // Scope to use to access user's Drive items.

    var pickerApiLoaded = false;
    var oauthToken;

    function onPickerApiLoad() {
      pickerApiLoaded = true;
      createPicker();
    }
    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        window.gapi.load('drive-share', init);
        pickerApiLoaded = true;
        createPicker();
      }
    }
    function onAuthApiLoad() {
      window.gapi.auth.authorize(
        {
          client_id: CLIENT_ID,
          scope: SCOPES,
          immediate: false
        },
        handleAuthResult
      );
    }

    // Create and render a Picker object for searching images.
    function createPicker() {
      if (pickerApiLoaded && oauthToken) {
        var view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
        view.setMimeTypes("application/vnd.google-apps.spreadsheet");
        var picker = new window.google.picker.PickerBuilder()
          .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
          .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
          .setAppId(appId)
          .setOAuthToken(oauthToken)
          .addView(view)
          .addView(new window.google.picker.DocsUploadView())
          .setDeveloperKey(developerKey)
          .setCallback(pickerCallback)
          .build();
        picker.setVisible(true);
      }
    }

    // A simple callback implementation.
    var pickerCallback = data => {
      if (data.action == window.google.picker.Action.PICKED) {
        var fileId = data.docs[0].id;
        window.gapi.client.drive.files.copy({fileId:fileId, resource:{name:"ESHKET"}}).then(response => {
          console.log(response);
        })
        window.gapi.client.drive.permissions
          .list({ fileId: fileId, fields: "*" })
          .then(response => {
            console.log(response);
            // this.setState({
            //   url:
            //     "https://lh3.google.com/0Gag73VHZTGFCtUSOdtCvoKl-x0Dbv71oGBOvjgeO8xeSoDmsE0ENmVmrexGDdErnZ3mSqrkd18vpchjj177hi8K0dwtDLhg=w320"
            // });
          });
        this.setState({
          url: `https://drive.google.com/thumbnail?authuser=0&sz=w320&id=${fileId}`
        });
        alert("The user selected: " + fileId);
       
      }
    };
    function handleClientLoad() {
      window.gapi.load("client:auth2:auth:picker", initClient);
      //window.gapi.load("auth", { callback: onAuthApiLoad });
      
      //window.gapi.load("picker", { callback: onPickerApiLoad });
      
    }

var init = () => {
        var s = new window.gapi.drive.share.ShareClient();
        s.setOAuthToken(oauthToken);
        s.setItemIds(['1XSgNsTb2Bk5TTWcTfRyIv60_qw4UVHmQRPypak7WNoI']);
        s.showSettingsDialog()
    }
    

    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    function initClient() {
       window.gapi.auth.authorize(
        {
          client_id: CLIENT_ID,
          scope: SCOPES,
          immediate: false
        },
        handleAuthResult
      );
      window.gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        })
        .then(
          function() {
            // Listen for sign-in state changes.
            window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

            // Handle the initial sign-in state.
            updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
          },
          function(error) {
            appendPre(JSON.stringify(error, null, 2));
          }
        );
    }

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    function updateSigninStatus(isSignedIn) {
      if (isSignedIn) {
        authorizeButton.style.display = "none";
        signoutButton.style.display = "block";
        listFiles();
      } else {
        authorizeButton.style.display = "block";
        signoutButton.style.display = "none";
      }
    }

    /**
     *  Sign in the user upon button click.
     */
    function handleAuthClick(event) {
      window.gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    function handleSignoutClick(event) {
      window.gapi.auth2.getAuthInstance().signOut();
    }

    /**
     * Append a pre element to the body containing the given message
     * as its text node. Used to display the results of the API call.
     *
     * @param {string} message Text to be placed in pre element.
     */
    function appendPre(message) {
      var pre = document.getElementById("content");
      var textContent = document.createTextNode(message + "\n");
      pre.appendChild(textContent);
    }

    /**
     * Print files.
     */
    var listFiles = () => {
      window.gapi.client.drive.files
        .list({
          pageSize: 10,
          fields: "nextPageToken, files(id, name)"
        })
        .then(function(response) {
          appendPre("Files:");
          var files = response.result.files;
          if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              appendPre(file.name + " (" + file.id + ")");
            }
          } else {
            appendPre("No files found.");
          }
        });
      window.gapi.client.drive.files
        .get({ fileId: "1FPeKddAkiiVhgX1-C3-2U1JOnux0C-F4PNcXoAbdlxw", fields: "*" })
        .then(response => {
          console.log(response);
          

          //console.log(response);
          // this.setState({
          //   url:
          //     "https://lh3.google.com/0Gag73VHZTGFCtUSOdtCvoKl-x0Dbv71oGBOvjgeO8xeSoDmsE0ENmVmrexGDdErnZ3mSqrkd18vpchjj177hi8K0dwtDLhg=w320"
          // });
        });
      //window.gapi.client.drive.files.get;
    };
    /**
     *  On load, called to load the auth2 library and API client library.
     */

    console.log(window.CLIENT_ID);
  }

  render() {
    return (
      <div className="App">
        <header>
          <img src={this.state.url} className="App-logo" alt="logo" />
          <p>
            Edit <code>saarc/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <p>Drive API Quickstart</p>

          <button id="authorize_button" style={{ display: "none" }}>
            Authorize
          </button>
          <button id="signout_button" style={{ display: "none" }}>
            Sign Out
          </button>
        </header>
      </div>
    );
  }
}
