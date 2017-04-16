import React, { Component } from "react";
import SideBar from "./component/sidebar";
import Header from "./component/header";
import FeedContainer from "./component/feedContainer";
import _fetch from "./component/helper/_fetch";
import "./css/fontello.css";
require("es6-promise").polyfill();

class app extends Component {
  constructor(props) {
    super(props);
    this.handleSourceClick = this.handleSourceClick.bind(this);
    this.handleUpdateClick = this.handleUpdateClick.bind(this);
    this.renderCount = 0;
    this.cachedFeed = {};
    this.state = {
      feedUrl: "prothom-alo",
      totalItems: "",
      feeds: ""
    };
    this.fetch = _fetch.fetch.bind(this);
    this.fetchType = _fetch.fetchType.bind(this);
  }

  // start fetching after initial load, this should be defualt feed source user
  // want
  componentDidMount() {
    this.fetchType(this.state.feedUrl);
  }
  handleUpdateClick(event) {
    let getUrl = event.target.attributes.getNamedItem("data-href").value;
    this.setState({ feedUrl: getUrl });
    this.fetchType(getUrl, true);
  }
  handleSourceClick(event) {
    let getUrl = event.target.attributes.getNamedItem("data-href").value;
    // this will reduce unnecssery render if the both user request feed and feed
    // currently shown is same
    if (getUrl !== this.state.feedUrl) {
      this.setState({ feedUrl: getUrl });
      this.fetchType(getUrl, false);
    }
  }

  render() {
    console.log(this.state.feedUrl, this.renderCount++);
    return (
      <div>
        <Header />
        <div className="container-fluid">
          <div className="row">
            <SideBar
              totalItems={this.state.totalItems}
              handleSourceClick={this.handleSourceClick}
              handleUpdateClick={this.handleUpdateClick}
            />
            <FeedContainer
              feeds={this.state.feeds}
              sourceTitle={this.state.feedUrl}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default app;
