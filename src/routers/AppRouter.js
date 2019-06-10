import React from "react";
import { Router, Route, Switch, Link, NavLink } from "react-router-dom";
import createHistory from "history/createBrowserHistory";

import HomePage from "../pages/App";
import Docs from "../pages/docs";
import Function from "../pages/docs/page1";
import Help from "../pages/docs/page2";
import NotFound from "../pages/404";
import Header from "../components/Header";
import Footer from "../components/Footer";
// import MapPage from "../components/MapPage"

const history = createHistory();

const AppRouter = () => (
  <Router history={history}>
    <div>
      <Header />
      <div className={"pageContainer"}>
        <Switch>
          <Route path="/" component={HomePage} exact={true} />
          <Route path="/docs" component={Docs} exact={true} />
          <Route path="/docs/page1" component={Function} exact={true} />
          <Route path="/doce/page2" component={Help} exact={true} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  </Router>
);

export default AppRouter;
