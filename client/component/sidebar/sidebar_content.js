import React, { Component } from "react";
import MaterialTitlePanel from "./material_title_panel";
import PropTypes from "prop-types";
import "../../css/sidebar.less";
const feedSource = PRODUCTION
  ? require("../../../config/source_pro.json")
  : require("../../../config/source.json");

const styles = {
  icon: {
    color: "#03a9f4"
  },
  sidebar: {
    width: 256,
    height: "100%"
  },
  sidebarLink: {
    display: "block",
    padding: "16px 0px",
    color: "#757575",
    textDecoration: "none"
  },
  divider: {
    margin: "8px 0",
    height: 1,
    backgroundColor: "#757575"
  },
  content: {
    padding: "16px",
    height: "100%",
    backgroundColor: "white"
  }
};

class SidebarContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceInfo: this.props.sourceInfo
    };
  }
  renderList(clickCtrl, handleUpdateClick) {
    var sourceListView = [];
    for (var i in feedSource) {
      var className = i === this.props.feedUrl
        ? "justify-content-between active"
        : "justify-content-between";
      sourceListView.push(
        <li key={i} className={className}>
          <span className="sourceLink">
            <a onClick={clickCtrl} href="#" data-href={i}>
              <i className="icon-right-circle" style={{ marginRight: "5px" }} />
              {i}
            </a>
            <span className="badge"># {this.state.sourceInfo[i].feedItem}</span>
          </span>

          <span>
            <a href="#">
              <i
                style={{ color: "white" }}
                data-href={i}
                onClick={handleUpdateClick}
                className="icon-arrows-cw"
              />
            </a>
          </span>
        </li>
      );
    }
    return sourceListView;
  }
  render() {
    let props = this.props;
    const style = props.style
      ? { ...styles.sidebar, ...props.style }
      : styles.sidebar;
    return (
      <MaterialTitlePanel title="Menu" style={style}>
        <div style={styles.content}>
          <a href="#" style={styles.sidebarLink}>
            <i style={styles.icon} className="icon-home" /> Home
          </a>
          <a href="#" style={styles.sidebarLink}>
            <i style={styles.icon} className="icon-rss" />
            Feed sources
          </a>
          <div style={styles.divider} />
          <ul className="soucelist">
            {this.state.sourceInfo &&
              this.renderList(props.handleSourceClick, props.handleUpdateClick)}
          </ul>

        </div>
      </MaterialTitlePanel>
    );
  }
}

SidebarContent.propTypes = {
  style: PropTypes.object,
  feedUrl: PropTypes.string,
  handleSourceClick: PropTypes.func,
  handleUpdateClick: PropTypes.func,
  sourceInfo: PropTypes.any
};

export default SidebarContent;
