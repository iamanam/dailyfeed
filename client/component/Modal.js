import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

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
  render() {
    return (
      <span>
        <a href="#" onClick={this.toggle}>
          {this.props.title}
        </a>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalBody>
            <iframe
              width="98%"
              height="80%"
              className="embed-responsive-item"
              src={this.props.src}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.toggle}>Do Something</Button>
            {" "}
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </span>
    );
  }
}

export default ModalExample;
