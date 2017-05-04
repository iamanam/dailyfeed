import React, { Component } from "react";
import {
  ListGroup,
  ListGroupItemHeading,
  ListGroupItem,
  ListGroupItemText
} from "reactstrap";
import ModalExample from "./Modal";
import "../css/listFeed.less";
import propTypes from "prop-types";
import timeago from "timeago.js";
let timeInstance = timeago();
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
    return (
      <div className="feed-container">
        <ListGroup id={this.state.sourceTitle} className="list-feeds">
          {Object.keys(this.state.feeds).map((key, index) => {
            let feed = this.state.feeds[key];
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
                  {feed.description
                    .toString()
                    .replace(/(<p>|<\/p>)/g, "")
                    .slice(0, 200)}
                  {" "}
                  --&gt;
                  <small className="">
                    <a href={feed.link}>...বিস্তারিত</a>
                  </small>
                </ListGroupItemText>
                <small className="text-muted">
                  {timeInstance.format(feed.pubDate)}
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
  sourceTitle: propTypes.string
};
export default ListFeeds;
