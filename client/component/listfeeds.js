import React, { Component } from "react";
import {
  ListGroup,
  ListGroupItemHeading,
  ListGroupItem,
  ListGroupItemText
} from "reactstrap";
import "../css/listFeed.less";
import propTypes from "prop-types";
import timeago from "timeago.js";
import SkyLight from "react-skylight";

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
    const style = {
      modalStyle: {
        backgroundColor: "#00897B",
        color: "#ffffff",
        width: "85%",
        height: "90%",
        marginTop: "-300px",
        marginLeft: "-42.5%",
        top: "57%",
        overflow: "scroll",
        lineHeight: 1.5
      },
      description: {
        color: "black",
        backgroundColor: "rgba(231, 239, 238, 0.95)",
        padding: "3%",
        lineHeight: "1.8"
      }
    };
    return (
      <div className="feed-container">
        <ListGroup id={this.state.sourceTitle} className="list-feeds">
          {Object.keys(this.state.feeds).map((key, index) => {
            let feed = this.state.feeds[key];
            return (
              <ListGroupItem className="feed-item" key={index}>
                <ListGroupItemHeading>
                  <span className="icon-right-open" />
                  <a href="#" onClick={() => this.refs[index].show()}>
                    {feed.title}
                  </a>
                </ListGroupItemHeading>
                <SkyLight
                  dialogStyles={style.modalStyle}
                  hideOnOverlayClicked
                  ref={index}
                  title={feed.title}
                  closeButtonStyle={{ color: "white" }}
                >
                  <div
                    style={style.description}
                    className="description"
                    dangerouslySetInnerHTML={{ __html: feed.description }}
                  />
                </SkyLight>
                <ListGroupItemText>
                  {feed.description
                    .toString()
                    .replace(/(<p>|<\/p>)/g, "")
                    .slice(0, 200)}
                  <small className="">
                    <a href={feed.link}>...বিস্তারিত</a>
                  </small>
                </ListGroupItemText>

                <small className="text-muted">
                  <i className="icon-clock" />
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
