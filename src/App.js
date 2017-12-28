import React, { Component } from 'react';
import Nav from './Nav';
import Loader from './Loader';
import PhotoView from "./PhotoView";

class App extends Component {

  constructor() {
    super();
    this.state = {
      photoNum: 1,
      brightness: 1,
      zoom: 1,
      zoomByMouse: false,
      loading: true
    };
  }

  getPhotoURL() {
    return `/photo/${this.state.photoNum}.png`;
  }

  limitZoom(zoom) {
    return zoom < 0.3
      ? 0.3
      : zoom > 50 ? 50 : zoom;
  }

  handleZoomIn = () => {
    this.setState({
      zoom: this.limitZoom(this.state.zoom * 1.3),
      zoomByMouse: false
    });
  };

  handleZoomOut = () => {
    this.setState({
      zoom: this.limitZoom(this.state.zoom / 1.3),
      zoomByMouse: false
    });
  };

  limitBrightness(brightness) {
    return brightness > 0
      ? brightness < 5 ? brightness : 5
      : 0;
  }

  handleBrightnessUp = () => {
    this.setState({
      brightness: this.limitBrightness(this.state.brightness * 1.2)
    });
  };

  handleBrightnessDown = () => {
    this.setState({
      brightness: this.limitBrightness(this.state.brightness / 1.2)
    });
  };

  handleNext = () => {
    this.setState({
      loading: true
    });

    // give time for animation before image disappears
    setTimeout(() => {
      this.setState({
        brightness: 1,
        zoom: 1,
        photoNum:  this.state.photoNum === 1 ? 2 : 1
      });
    }, 300);
  };

  handleLoad = () => {
    // simulate slow network
    setTimeout(() => {
      this.setState({
        loading: false
      });
    }, 1000);
  };

  handleWheel = (e) => {
    const ratio = 0.1;
    let delta = 1;

    if (this.state.loading) {
      return;
    }

    e.preventDefault();

    // limit wheel speed to prevent zoom too fast
    if (this.wheeling) {
      return;
    }

    this.wheeling = true;

    setTimeout(() => {
      this.wheeling = false;
    }, 25);

    if (e.deltaY) {
      delta = e.deltaY > 0 ? 1 : -1;
    } else if (e.wheelDelta) {
      delta = -e.wheelDelta / 120;
    } else if (e.detail) {
      delta = e.detail > 0 ? 1 : -1;
    }

    let zoomChange = (-delta * ratio) + 1;

    this.setState({
      zoomByMouse: true,
      zoom: this.limitZoom(this.state.zoom * zoomChange)
    });
  };

  render() {
    return (
      <div className={"App " + (this.state.loading ? "loading" : "")} onWheel={this.handleWheel}>
        <Nav
          onZoomIn={this.handleZoomIn}
          onZoomOut={this.handleZoomOut}
          onBrightnessUp={this.handleBrightnessUp}
          onBrightnessDown={this.handleBrightnessDown}
          onNext={this.handleNext}
        />
          {this.state.loading && <Loader/>}
          <div
            style={{
              opacity: this.state.loading ? 0 : 1,
              transition: 'opacity 0.2s',
              filter: `brightness(${this.state.brightness*100}%)`
            }}
          >
            <PhotoView
              photoURL={this.getPhotoURL()}
              zoom={this.state.zoom}
              zoomByMouse={this.state.zoomByMouse}
              offsetY={0}
              onLoad={this.handleLoad}
            />
          </div>
      </div>
    );
  }

}

export default App;
