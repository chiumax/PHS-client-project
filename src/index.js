import React from "react";
import ReactDOM from "react-dom";
import "./styles/normalize.css";
import AppRouter from "./routers/AppRouter";
import "./styles/styles.scss";
import App from "./pages/App";
import * as serviceWorker from "./serviceworker/serviceWorker";

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
