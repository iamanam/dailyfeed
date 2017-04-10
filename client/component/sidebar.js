import React, { Component } from 'react'
import { ListGroup, ListGroupItem, Badge } from 'reactstrap'
import feedSource from '../../server/src/feedSource'
import '../css/sidebar.less'

class SideBar extends Component {
  constructor (props) {
    super(props)
  }
  sideItem (clickCtrl) {
    var sourceListView = []
    Object.keys(feedSource).forEach(function (key) {
      sourceListView.push(
        <ListGroupItem key={key} className='justify-content-between'>
          <a onClick={clickCtrl} href='#' data-href={key}>
            {key}
          </a>
          <Badge pill>
            14
          </Badge>
        </ListGroupItem>
      )
    })
    return sourceListView
  }

  render () {
    return (
      <div className='soucelist col-sm-12 col-md-3 col-lg-2'>
        <ListGroup>
          {this.sideItem(this.props.handleSourceClick)}
        </ListGroup>
      </div>
    )
  }
}

export default SideBar
