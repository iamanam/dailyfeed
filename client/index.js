import React from "react";
import ReactDOM from "react-dom";
import App from "./app.js";
import "bootstrap/dist/css/bootstrap.css";
import "./css/header.less";
import "./css/listFeed.less";
const render = Component => {
  ReactDOM.render(<Component />, document.getElementById("root"));
};
render(App);
