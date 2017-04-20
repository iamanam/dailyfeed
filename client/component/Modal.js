import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import config from "../../config/config.json";
import propTypes from "prop-types";
class ModalExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };
    this.toggle = this.toggle.bind(this);
  }
  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }
  setModalBody() {
    if (config.local.newsSetting.scrapping === false) {
      return (
        <iframe
          width="98%"
          height="80%"
          className="embed-responsive-item"
          src={this.props.src}
        />
      );
    } else {
      return <p>{this.props.details}</p>;
    }
  }

  render() {
    return (
      <span>
        <a href="#" onClick={this.toggle}>
          {this.props.title}
        </a>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalBody />
          {this.setModalBody()}
          <ModalFooter>
            <Button color="primary" href={this.props.src} target="_blank">
              Visit page
            </Button>
            <Button color="secondary" onClick={this.toggle}>Back</Button>
          </ModalFooter>
        </Modal>
      </span>
    );
  }
}

ModalExample.propTypes = {
  title: propTypes.string,
  src: propTypes.string,
  details: propTypes.string
};
export default ModalExample;
