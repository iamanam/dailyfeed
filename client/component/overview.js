import React, { Component } from "react";
import propTypes from "prop-types";
import timeago from "timeago.js";
let timeInstance = timeago();

class Overview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceTitle: this.props.sourceTitle,
      lastFetched: this.props.lastFetched
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      lastFetched: nextProps.lastFetched,
      sourceTitle: nextProps.sourceTitle
    });
  }
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.sourceTitle !== this.props.sourceTitle ||
      nextProps.lastFetched !== this.props.lastFetched
    );
  }

  render() {
    let styles = {
      icon: { color: "white", marginLeft: "15px", marginRight: "5px" }
    };
    const { sourceTitle, lastFetched } = this.state;
    return (
      <div>
        {this.state.lastFetched &&
          <section className="detailsInfo">
            <p className="col-sm-12">
              <i className="icon-info" />
              <span>
                {sourceTitle}
                <i style={styles.icon} className="icon-clock" />
                Updated:
                {timeInstance.format(lastFetched)}
              </span>
            </p>
          </section>}
      </div>
    );
  }
}

Overview.propTypes = {
  lastFetched: propTypes.number,
  sourceTitle: propTypes.string
};
export default Overview;
