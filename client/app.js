import React, { Component } from "react";
import SideBar from "./component/sidebar";
import Header from "./component/header";
import FeedContainer from "./component/feedContainer";
import _fetch from "./component/helper/_fetch";
import Overview from "./component/overview";
import fetch from "isomorphic-fetch";
import "./css/app.less";
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
      feeds: "",
      sourceInfo: "",
      lastFetched: ""
    };
    this.fetch = _fetch.fetch.bind(this);
    this.fetchType = _fetch.fetchType.bind(this);
  }
  componentWillMount() {
    var self = this;
    (async function getInfo() {
      var res = await fetch("/source_info");
      var jsonData = await res.json();
      var stateObj = {};
      jsonData.map(item => {
        let i = item["Item"];
        stateObj[i["sourceTitle"]] = i;
      });
      self.setState({
        sourceInfo: stateObj,
        lastFetched: stateObj[self.state.feedUrl].lastFetched
      });
    })();
  }
  // start fetching after initial load, this should be defualt feed source user
  // want
  componentDidMount() {
    var self = this;
    (async function getInfo() {
      var res = await fetch("/source_info");
      var jsonData = await res.json();
      var stateObj = {};
      jsonData.map(item => {
        let i = item["Item"];
        stateObj[i["sourceTitle"]] = i;
      });
      self.setState({ sourceInfo: stateObj });
    })();

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
  loading() {
    return (
      <div className="loading col-sm-12 col-md-9 col-lg-10">
        <i className="icon-spin6">....loading </i>
      </div>
    );
  }
  sideBar() {
    return (
      <SideBar
        handleSourceClick={this.handleSourceClick}
        handleUpdateClick={this.handleUpdateClick}
        feedUrl={this.state.feedUrl}
        sourceInfo={this.state.sourceInfo}
      />
    );
  }

  render() {
    return (
      <div>
        <Header />
        <div className="container-fluid">
          <div className="row">
            {this.state.sourceInfo && this.sideBar()}
            {!this.state.feeds && this.loading()}
            {this.state.lastFetched &&
              <Overview
                sourceTitle={this.state.feedUrl}
                lastFetched={this.state.lastFetched}
              />}
            {this.state.feeds &&
              <FeedContainer
                feeds={this.state.feeds}
                sourceTitle={this.state.feedUrl}
              />}
          </div>
        </div>
      </div>
    );
  }
}

export default app;
