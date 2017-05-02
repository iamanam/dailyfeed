import React from "react";
import ReactDOM from "react-dom";
import App from "./app.js";
import { AppContainer } from "react-hot-loader";
import "./css/bootstrap/css/bootstrap.css";
import "./css/bootstrap/css/bootstrap-theme.css";
import "./css/header.less";
import "./css/listFeed.less";
// import { whyDidYouUpdate } from "why-did-you-update";

// Production value should be true after webpack bundle
if (PRODUCTION) {
  const render = Component => {
    ReactDOM.render(<Component />, document.getElementById("root"));
  };
  render(App);
} else {
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
  // whyDidYouUpdate(React);
}
