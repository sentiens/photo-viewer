import React from 'react';
import PropTypes from 'prop-types';
import 'pixi.js';
const PIXI = global.PIXI;

export default class PhotoView extends React.Component {
  static marginRatio = 0.98;
  static maxWidth = window.innerWidth * PhotoView.marginRatio;
  static maxHeight = window.innerHeight * PhotoView.marginRatio;

  static propTypes = {
    photoURL: PropTypes.string.isRequired,
    zoom: PropTypes.number.isRequired,
    zoomByMouse: PropTypes.bool,
    onLoad: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.PIXIApp = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        antialias: false,
        transparent: false,
        resolution: 1
      }
    );
    this.PIXIApp.renderer.backgroundColor = 0x2b2b2b;
    this.PIXIApp.renderer.view.style.position = "absolute";
    this.PIXIApp.renderer.view.style.display = "block";
    this.PIXIApp.renderer.autoResize = true;
    this.container.appendChild(this.PIXIApp.view);
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.loadImage();
    window.addEventListener('resize', () => {
      this.PIXIApp.renderer.resize(window.innerWidth, window.innerHeight);
      PhotoView.maxWidth = window.innerWidth * PhotoView.marginRatio;
      PhotoView.maxHeight = window.innerHeight * PhotoView.marginRatio;
      this.syncSpriteWithProps();
    });
  }

  syncSpriteWithProps(prevProps) {
    const sprite = this.PIXISprite;

    const originalWidth = sprite.width;
    const originalHeight = sprite.height;
    sprite.scale.set(this.calcFinalScale());
    const newWidth = sprite.width;
    const newHeight = sprite.height;

    let centerX;
    let centerY;

    if (this.props.zoomByMouse) {
      const globalMousePos = this.PIXIApp.renderer.plugins.interaction.mouse.global;
     centerX = globalMousePos.x;
     centerY = globalMousePos.y;
    } else {
      centerX = window.innerWidth / 2;
      centerY = window.innerHeight / 2;
    }

    sprite.x -= (newWidth - originalWidth) * (centerX - sprite.x) / originalWidth;
    sprite.y -= (newHeight - originalHeight) * (centerY - sprite.y) / originalHeight;
    this.fitSpriteInWindow();
  }

  calcFinalScale() {
    return this.spriteScale * this.props.zoom;
  }

  // prevent photo out of viewport
  fitSpriteInWindow() {
    const sprite = this.PIXISprite;

    if (sprite.width < window.innerWidth) {
      sprite.x = window.innerWidth / 2;
    } else if (sprite.x - sprite.width / 2 > 0) {
      sprite.x += -(sprite.x - sprite.width / 2);
    } else if (sprite.x + sprite.width / 2 < window.innerWidth) {
      sprite.x += window.innerWidth - (sprite.x + sprite.width / 2);
    }

    if (sprite.height < window.innerHeight) {
      sprite.y = window.innerHeight / 2;
    } else if (sprite.y - sprite.height / 2 > 0) {
      sprite.y += -(sprite.y - sprite.height / 2);
    } else if (sprite.y + sprite.height / 2 < window.innerHeight) {
      sprite.y += window.innerHeight - (sprite.y + sprite.height / 2);
    }
  }

  loadImage() {
    if (this.PIXISprite) { // if we have previously loaded photo cleanup resources to prevent leaks
      this.PIXIApp.stage.removeChild(this.PIXISprite);
      this.PIXISprite.destroy({
        children: true,
        texture: true,
        baseTexture: true
      });
    }

    const loader = new PIXI.loaders.Loader(); // use loader once per photo to prevent leaks
    loader
      .add(this.props.photoURL)
      .load(() => {
        const sprite = new PIXI.Sprite(
          loader.resources[this.props.photoURL].texture
        );

        sprite.interactive = true;
        sprite.buttonMode = true;
        sprite.cursor = 'move';
        function moveEnd() {
          this.moving = false;
          this.movingData = null;
        }
        const that = this;
        sprite
          .on('pointerdown', function (e) {
            this.moving = true;
            this.movingData = e.data;
            const localPosition = this.movingData.getLocalPosition(this);
            // calc shift considering scaling
            const finalScale = that.calcFinalScale();
            this.movingShiftX = localPosition.x * finalScale;
            this.movingShiftY = localPosition.y * finalScale;
          })
          .on('pointermove', function (e) {
            if (this.moving) {
              const newPosition = this.movingData.getLocalPosition(this.parent);

              this.x = newPosition.x - this.movingShiftX;
              this.y = newPosition.y - this.movingShiftY;
              that.fitSpriteInWindow();
            }
          })
          .on('pointerup', moveEnd)
          .on('pointerupoutside', moveEnd)
        ;

        this.PIXIApp.stage.addChild(sprite);
        this.PIXISprite = sprite;

        let scale = 1;

        // assuming image always larger than screen
        if (sprite.width > PhotoView.maxWidth) {
          scale = PhotoView.maxWidth / sprite.width;
        }

        if (sprite.height * scale > PhotoView.maxHeight) {
          scale = PhotoView.maxHeight / sprite.height;
        }
        this.spriteScale = scale;
        sprite.anchor.set(0.5);
        sprite.scale.set(scale);
        this.fitSpriteInWindow();

        this.syncSpriteWithProps();
        loader.destroy(); // once it loaded destroy loader
        this.props.onLoad();
      })
    ;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.photoURL !== this.props.photoURL) {
      this.loadImage()
    } else if (this.PIXISprite) { // ensure initialized
      this.syncSpriteWithProps(prevProps);
    }
  }

  render() {
    return <div ref={(e) => this.container = e}></div>
  }
}
