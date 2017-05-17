import React, { Component } from "react";
import FeedContainer from "./component/feedContainer";
import _fetch from "./component/helper/_fetch";
import Overview from "./component/overview";
import fetch from "isomorphic-fetch";
import Sidebar from "./sidebar";
import { contentHeader } from "./component/header";
import {
  onSetOpen,
  mediaQueryChanged,
  toggleOpen,
  sideBar
} from "./component/helper/_sidebar";

// ----------------------------Load css----------------------
import "./css/header.less";
import "./css/app.less";
import "./css/fontello/css/feedparser_icons.css";
import "./css/fontello/css/animation.css";
require("es6-promise").polyfill();

const mql = window.matchMedia(`(min-width: 800px)`);

class app extends Component {
  constructor(props) {
    super(props);
    this.handleSourceClick = this.handleSourceClick.bind(this);
    this.handleUpdateClick = this.handleUpdateClick.bind(this);
    this.renderCount = 0;
    this.cachedFeed = {};
    this.state = {
      mql: mql,
      docked: false,
      open: false,
      feedUrl: "prothom-alo",
      feeds: "",
      sourceInfo: "",
      lastFetched: ""
    };
    this.fetch = _fetch.fetch.bind(this);
    this.fetchType = _fetch.fetchType.bind(this);
    this.mediaQueryChanged = mediaQueryChanged.bind(this);
    this.toggleOpen = toggleOpen.bind(this);
    this.onSetOpen = onSetOpen.bind(this);
    this.sideBar = sideBar.bind(this);
    this.contentHeader = contentHeader.bind(this);
  }

  componentWillUnmount() {
    this.state.mql.removeListener(this.mediaQueryChanged);
  }
  componentWillMount() {
    mql.addListener(this.mediaQueryChanged);
    this.setState({ mql: mql, docked: mql.matches });
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
      self.setState({
        sourceInfo: stateObj,
        lastFetched: stateObj[self.state.feedUrl].lastFetched
      });
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
  mainContent() {
    return (
      <div>
        <div className="container-fluid">
          <div className="row">
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
  render() {
    const sidebarProps = {
      sidebar: this.sideBar(),
      docked: this.state.docked,
      open: this.state.open,
      onSetOpen: this.onSetOpen
    };
    if (sidebarProps.sidebar) {
      return (
        <Sidebar {...sidebarProps}>
          <header>
            {this.contentHeader()}
          </header>
          <div className="mainContent">
            {this.mainContent()}
          </div>
        </Sidebar>
      );
    }
    return (
      <div>
        <i style={{ fontSize: "50px" }} className="icon-spin5 loading" />
      </div>
    );
  }
}

export default app;
