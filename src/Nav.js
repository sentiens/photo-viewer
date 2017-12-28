import React from 'react';
import PropTypes from 'prop-types';
import './Nav.css';

const Nav = ({onZoomIn, onZoomOut, onBrightnessUp, onBrightnessDown, onNext}) => (
  <header className="Nav">
    <div className="btn-group">
      <button className="btn" onClick={onZoomOut}>
        <i className="fa fa-minus"></i>
      </button>
      <i className="fa fa-search"></i>
      <button className="btn" onClick={onZoomIn}>
        <i className="fa fa-plus"></i>
      </button>
    </div>

    <div className="btn-group">
      <button className="btn" onClick={onBrightnessDown}>
        <i className="fa fa-minus"></i>
      </button>
      <i className="fa fa-sun-o"></i>
      <button className="btn" onClick={onBrightnessUp}>
        <i className="fa fa-plus"></i>
      </button>
    </div>
    <div className="btn-group">
      <button className="btn" onClick={onNext}>Следующая</button>
    </div>
  </header>
);

Nav.propTypes = {
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  onBrightnessUp: PropTypes.func.isRequired,
  onBrightnessDown: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired
};

export default Nav;



