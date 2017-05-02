import React, { Component } from "react";
import propTypes from "prop-types";
import timeago from "timeago.js";

class Overview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceTitle: this.props.sourceTitle,
      lastFetched: this.props.lastFetched
    };
  }
  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
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
  element() {
    const { sourceTitle, lastFetched } = this.state;
    return (
      <nav className="navbar detailsInfo col-sm-12 col-md-9 col-lg-10">
        <div className="row">
          <p className="col-sm-4">
            <i className="icon-info" />
            <span>{sourceTitle}</span>
          </p>
          <p className="col-sm-8 flex-last timeShow">
            Updated:
            {timeago(lastFetched).format()}
          </p>
        </div>
      </nav>
    );
  }
  render() {
    return (
      <div>
        {this.state.lastFetched && this.element()}
      </div>
    );
  }
}

Overview.propTypes = {
  lastFetched: propTypes.string,
  sourceTitle: propTypes.string
};
export default Overview;
