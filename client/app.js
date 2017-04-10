import React, { Component } from 'react'
import SideBar from './component/sidebar'
import Header from './component/header'
import FeedContainer from './component/feedContainer'

export default class app extends Component {
  constructor (props) {
    super(props)
    this.handleSourceClick = this.handleSourceClick.bind(this)
    this.state = {
      feedUrl: ''
    }
  }
  handleSourceClick (event) {
    let getUrl = event.target.attributes.getNamedItem('data-href').value
    this.setState({feedUrl: getUrl + '.json'})
  }
  render () {
    return (
      <div>
        <Header/>
        <div className='container-fluid'>
          <div className='row'>
            <SideBar handleSourceClick={this.handleSourceClick}></SideBar>
            <FeedContainer feedUrl={this.state.feedUrl} />
          </div>
        </div>
      </div>
    )
  }
}
