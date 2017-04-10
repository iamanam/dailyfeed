import React, { Component } from 'react'
import { ListGroup, ListGroupItemHeading, ListGroupItem, ListGroupItemText } from 'reactstrap'

class ListFeeds extends Component {
  constructor (props) {
    super(props)
    this.state = {
      feeds: this.props.feeds
    }
  }
  componentWillReceiveProps (nextProps) {
    console.log(nextProps.feeds == this.state.feeds, 'state' + this.state.feeds + '\n next :' + nextProps.feeds)
    if (nextProps.feeds !== this.state.feeds) {
      return this.setState({feeds: nextProps.feeds})
    }
  }
  render () {
    return (
      <ListGroup>
        {this
           .state
           .feeds
           .map((feed, index) => {
             return (
               <ListGroupItem key={index}>
                 <ListGroupItemHeading>
                   {feed.title}
                 </ListGroupItemHeading>
                 <ListGroupItemText>
                   {feed.description}
                 </ListGroupItemText>
               </ListGroupItem>
             )
           })}
      </ListGroup>

    )
  }
}

export default ListFeeds
