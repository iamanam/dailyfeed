import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import App from "./app.js";
import "./css/bootstrap/css/bootstrap.css";
import "./css/bootstrap/css/bootstrap-theme.css";
import "./css/header.less";
import "./css/listFeed.less";

// Production value should be true after webpack bundle
if (PRODUCTION) {
  const render = Component => {
    ReactDOM.render(<Component />, document.getElementById("root"));
  };
  render(App);
} else {
  const AppContainer = require("react-hot-loader");
  const render = Component => {
    ReactDOM.render(
      <AppContainer>
        <Component />
      </AppContainer>,
      document.getElementById("root")
    );
  };
  render(App);

  if (module.hot) {
    module.hot.accept(App, () => {
      render(App);
    });
  }
}
