import React, { Component } from "react";
import {
  ListGroup,
  ListGroupItemHeading,
  ListGroupItem,
  ListGroupItemText
} from "reactstrap";
import { getItem } from "../../server/db/helper";
import ModalExample from "./Modal";
import moment from "moment";
import "../css/listFeed.less";
import propTypes from "prop-types";

class ListFeeds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feeds: this.props.feeds,
      sourceTitle: this.props.sourceTitle,
      lastFetched: this.props.lastFetched
    };
  }
  componentDidMount() {
    /*
    getItem("FeedSourceInfo", { sourceTitle: this.state.sourceTitle })
      .promise()
      .then(d => {
        this.setState({ lastFetched: d.Item.lastFetched });
      });
      */
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
    let fetchTime = moment(this.state.lastFetched).calendar();
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
              {fetchTime}
            </p>
          </div>
        </nav>
        <ListGroup id={this.state.sourceTitle} className="list-feeds">
          {Object.keys(this.state.feeds).map((key, index) => {
            var feed = this.state.feeds[key];
            return (
              <ListGroupItem className="feed-item" key={index}>
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
  feeds: propTypes.object,
  sourceTitle: propTypes.string,
  lastFetched: propTypes.string
};
export default ListFeeds;
