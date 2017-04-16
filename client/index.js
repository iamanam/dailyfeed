import React from "react";
import ReactDOM from "react-dom";
import App from "./app.js";
import { AppContainer } from "react-hot-loader";
import "bootstrap/dist/css/bootstrap.css";
import "./css/header.less";
import "./css/listFeed.less";
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
