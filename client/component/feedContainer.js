import React, { Component } from "react";
import propTypes from "prop-types";
import ListFeed from "./listfeeds";
import "../css/feedcontainer.less";

export default class FeedContainer extends Component {
  constructor(props) {
    super(props);
    this.cachedFeed = {};
    this.state = {
      feeds: this.props.feeds,
      sourceTitle: this.props.sourceTitle || "prothom-alo"
    };
  }
  // After props change setstate and fetch
  componentWillReceiveProps(nextProps) {
    this.setState({
      feeds: nextProps.feeds,
      sourceTitle: nextProps.sourceTitle
    });
  }
  render() {
    return (
      <div id="feed-container" className="col-sm-12 col-md-9 col-lg-10">
        {this.state.feeds &&
          <ListFeed
            sourceTitle={this.state.sourceTitle}
            feeds={this.state.feeds.items}
          />}
      </div>
    );
  }
}

FeedContainer.propTypes = {
  feeds: propTypes.any,
  sourceTitle: propTypes.string
};
