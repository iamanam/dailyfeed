import React, { Component } from "react";
import propTypes from "prop-types";
import { ListGroup, ListGroupItem, Badge } from "reactstrap";
import feedSource from "../../config/source.json";
import "../css/sidebar.less";
import { docClient } from "../../server/db/initDb";

class SideBar extends Component {
  componentWillMount() {
    var self = this;
    self.state = {};
    (async function getInfo(sourceTitle) {
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
      return self.state;
    })();
  }

  sideItem(clickCtrl, handleUpdateClick) {
    var sourceListView = [];
    for (var i in feedSource) {
      sourceListView.push(
        <ListGroupItem key={i} className="justify-content-between">
          <a onClick={clickCtrl} href="#" data-href={i}>
            {i} - <Badge pill>
              {this.state[i].feedItem}
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

  render() {
    return (
      <div className="soucelist col-sm-12 col-md-3 col-lg-2">
        <ListGroup>
          {this.sideItem(
            this.props.handleSourceClick,
            this.props.handleUpdateClick
          )}
        </ListGroup>
      </div>
    );
  }
}
SideBar.propTypes = {
  handleSourceClick: propTypes.func,
  handleUpdateClick: propTypes.func
};
export default SideBar;
