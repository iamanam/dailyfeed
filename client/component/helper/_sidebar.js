import React from "react";
import SidebarContent from "../sidebar/sidebar_content";

export function onSetOpen(open) {
  this.setState({ open: open });
}
export function mediaQueryChanged() {
  this.setState({
    mql: mql,
    docked: this.state.mql.matches
  });
}

export function toggleOpen(ev) {
  this.setState({ open: !this.state.open });
  if (ev) ev.preventDefault();
}

export function sideBar() {
  if (this.state.sourceInfo)
    return (
      <SidebarContent
        handleSourceClick={this.handleSourceClick}
        handleUpdateClick={this.handleUpdateClick}
        feedUrl={this.state.feedUrl}
        sourceInfo={this.state.sourceInfo}
      />
    );
}
