import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import App from "./app.js";
import "./css/bootstrap/css/bootstrap.css";
import "./css/bootstrap/css/bootstrap-theme.css";
import "./css/header.less";
import "./css/listFeed.less";
const render = Component => {
  ReactDOM.render(<Component />, document.getElementById("root"));
};
render(App);
