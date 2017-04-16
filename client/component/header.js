import React, { Component } from "react";
// import { Nav, NavItem, NavLink } from 'reactstrap'
class Header extends Component {
  render() {
    return (
      <div className="navbar-component">
        <div className="navbar area">
          <a href="#" className="brand">FeedRead</a>
          <nav role="navigation" id="navigation" className="list">
            <a href="#" className="item -link">Home</a>
            <a href="#" className="item -link">Feed</a>
            <a href="#" className="item -link">Source</a>
            <a href="#" className="item -link">Contact</a>
            <span className="item"><i className="fa fa-search" /></span>
          </nav>
          <button data-collapse data-target="#navigation" className="toggle">
            <span className="icon" />
          </button>
        </div>
      </div>
    );
  }
}

export default Header;
