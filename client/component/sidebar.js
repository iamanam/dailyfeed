import React, { Component } from "react";
import propTypes from "prop-types";
import { ListGroup, ListGroupItem, Badge } from "reactstrap";
import feedSource from "../../config/source.json";
import "../css/sidebar.less";

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = { info: props.sourceInfo };
  }

  sideItem(clickCtrl, handleUpdateClick) {
    var sourceListView = [];
    for (var i in feedSource) {
      var className = i === this.props.feedUrl
        ? "justify-content-between active"
        : "justify-content-between";
      sourceListView.push(
        <ListGroupItem key={i} className={className}>
          <a onClick={clickCtrl} href="#" data-href={i}>
            {i} # <Badge pill>
              {this.state.info[i].feedItem}
            </Badge>
          </a>
          <span>
            <a href="#">
              <i
                data-href={i}
                onClick={handleUpdateClick}
                className="icon-arrows-cw"
              />
            </a>
          </span>
        </ListGroupItem>
      );
    }
    return sourceListView;
  }
  listRender() {
    return (
      <ListGroup>
        {this.sideItem(
          this.props.handleSourceClick,
          // now updating is same like fetching so..
          this.props.handleUpdateClick
          // -----------------------------------------
        )}
      </ListGroup>
    );
  }
  render() {
    return (
      <div className="soucelist col-sm-12 col-md-3 col-lg-2">
        {this.props.sourceInfo && this.listRender()}
      </div>
    );
  }
}
SideBar.propTypes = {
  feedUrl: propTypes.string,
  handleSourceClick: propTypes.func,
  handleUpdateClick: propTypes.func,
  sourceInfo: propTypes.any
};
export default SideBar;

/* 
     await Object.keys(feedSource).map(i => {
        self.state[i] = "";
        return docClient
          .get({
            TableName: "FeedSourceInfo",
            Key: { sourceTitle: i }
          })
          .promise()
          .then(v => {
            var obj = {};
            obj[i] = v.Item;
            self.setState(obj);
          });
      });
      */
