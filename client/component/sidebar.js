import React, { Component } from "react";
import propTypes from "prop-types";
import { ListGroup, ListGroupItem, Badge } from "reactstrap";
import feedSource from "../../server/src/feedSource";
import "../css/sidebar.less";

class SideBar extends Component {
  sideItem(clickCtrl, handleUpdateClick) {
    var sourceListView = [];
    for (var i in feedSource) {
      let key = feedSource[i];
      sourceListView.push(
        <ListGroupItem key={i} className="justify-content-between">
          <a onClick={clickCtrl} href="#" data-href={i}>
            {i} - <Badge pill>
              {key.feedLength}
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
