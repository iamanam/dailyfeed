import React, { Component } from 'react'
import ListFeed from './listfeeds'
import fetch from 'isomorphic-fetch'
import '../css/feedcontainer.less'
require('es6-promise').polyfill()

export default class FeedContainer extends Component {
  constructor (props) {
    super(props)
    this.cachedFeed = {}
    this.state = {
      feedUrl: 'prothom-alo.json',
      feeds: ''
    }
  }
  fetch (url) {
    let self = this
    // if feeds already fetched then serve it from cache
    if (this.cachedFeed[url]) {
      // console.log('serving from cache')
      return this.cachedFeed[url]
    }
    // if contents are not cached then fetch and cache it
    return new Promise(resolve => {
      fetch(url)
        .then(function (response) {
          if (response.status >= 400) {
            throw new Error('Bad response from server')
          }
          resolve(response.json())
        })
    }).then((feeds) => {
      self.setState({feeds: feeds})
      // save this for caching purpose
      self.cachedFeed[url] = feeds
    })
  }

  // start fetching after initial load, this should be defualt feed source user want
  componentDidMount () {
    this.fetch('prothom-alo.json')
  }
  // After props change setstate and fetch
  componentWillReceiveProps (nextProps) {
    this.setState({feedUrl: nextProps.feedUrl})
    this.fetch(nextProps.feedUrl)
  }
  render () {
    return (
      <div id='feed-container' className='col-sm-12 col-md-9 col-lg-10'>
        {this.state.feeds && <ListFeed feeds={this.state.feeds.items} />}
      </div>
    )
  }
}
