import React from 'react';
import Loader from 'react-loaders';
import 'loaders.css/loaders.min.css';
import './Loader.css';

export default () => <div className="Loader-container">
  <Loader type="ball-clip-rotate" />
</div>;