import React, { Component } from "react";
import {
  ListGroup,
  ListGroupItemHeading,
  ListGroupItem,
  ListGroupItemText
} from "reactstrap";
import ModalExample from "./Modal";
import moment from "moment";
import "../css/listFeed.less";
import feedSource from "../../config/source";
import propTypes from "prop-types";

class ListFeeds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feeds: this.props.feeds,
      sourceTitle: this.props.sourceTitle
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.feeds !== this.state.feeds) {
      return this.setState({
        feeds: nextProps.feeds,
        sourceTitle: nextProps.sourceTitle
      });
    }
  }
  render() {
    let sourceInfo = feedSource[this.state.sourceTitle];
    let fetchTime = moment(sourceInfo.lastfetch);
    return (
      <div className="feed-container">
        <nav className="navbar navbar-inverse bg-primary">
          <div className="row">
            <p className="col">
              <i className="icon-info" />
              <span>{this.state.sourceTitle}</span>
            </p>
            <p className="col-8 flex-last timeShow">
              Updated:
              {fetchTime.calendar()}
            </p>
          </div>
        </nav>
        <ListGroup>
          {this.state.feeds.map((feed, index) => {
            return (
              <ListGroupItem key={index}>
                <ListGroupItemHeading>
                  <span className="icon-right-open" />
                  <ModalExample
                    title={feed.title}
                    src={feed.link}
                    details={feed.description}
                  />
                </ListGroupItemHeading>
                <ListGroupItemText>
                  {feed.description.toString().slice(0, 200)} --&gt;
                  <small className="">
                    <a href={feed.link}>...বিস্তারিত</a>
                  </small>
                </ListGroupItemText>
                <small className="text-muted">
                  {moment(feed.pubDate).calendar()}
                </small>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      </div>
    );
  }
}
ListFeeds.propTypes = {
  feeds: propTypes.array,
  sourceTitle: propTypes.string
};
export default ListFeeds;
