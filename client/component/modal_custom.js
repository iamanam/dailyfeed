import React, { Component } from "react";
import propTypes from "prop-types";
class Modal extends Component {
  componentDidMount() {
    var modal = document.querySelector("#modal");
    var modalOverlay = document.querySelector("#modal-overlay");
    var closeButton = document.querySelector("#close-button");
    var openButton = document.querySelector("#open-button");

    closeButton.addEventListener("click", function() {
      modal.classList.toggle("closed");
      modalOverlay.classList.toggle("closed");
    });

    openButton.addEventListener("click", function() {
      modal.classList.toggle("closed");
      modalOverlay.classList.toggle("closed");
    });
  }

  render() {
    return (
      <div>
        <div className="modal-overlay" id="modal-overlay" />
        <div className="modal" id="modal">
          <button className="close-button" id="close-button">
            Obvious Close Button
          </button>
          <div className="modal-guts">
            <h1>Modal Example</h1>
            <iframe src={this.props.src} />
          </div>
        </div>
        <a href="#" id="open-button" className="open-button">
          {this.props.title}
        </a>
      </div>
    );
  }
}

Modal.propTypes = {
  src: propTypes.string,
  title: propTypes.string
};

export default Modal;
