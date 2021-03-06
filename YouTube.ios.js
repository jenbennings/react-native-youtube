/**
 * @providesModule YouTube
 * @flow
 */

'use strict';

var React = require('react-native');
var ReactIOSViewAttributes = require('ReactNativeViewAttributes');
var PropTypes = require('ReactPropTypes');
var styleSheetPropType = require('StyleSheetPropType');
var ViewStylePropTypes = require('ViewStylePropTypes');
var NativeMethodsMixin = require('NativeMethodsMixin');
var flattenStyle = require('flattenStyle');
var merge = require('merge');
var {
  StyleSheet,
  requireNativeComponent,
  NativeModules,
} = require('react-native');

var YouTube = React.createClass({
  getInitialState: function () {
    this._exportedProps = NativeModules.YouTubeManager && NativeModules.YouTubeManager.exportedProps;

    return {};
  },

  propTypes: {
    style: styleSheetPropType(ViewStylePropTypes),
    videoId: PropTypes.string.isRequired,
    playsInline: PropTypes.bool,
    play: PropTypes.bool,
    hidden: PropTypes.bool,
    onReady: PropTypes.func,
    onChangeState: PropTypes.func,
    onChangeQuality: PropTypes.func,
    onError: PropTypes.func,
  },

  mixins: [NativeMethodsMixin],

  viewConfig: {
    uiViewClassName: 'UIView',
    validAttributes: ReactIOSViewAttributes.UIView,
  },

  _onReady: function (event) {
    return this.props.onReady && this.props.onReady(event.nativeEvent);
  },

  _onChangeState: function (event) {
    return this.props.onChangeState && this.props.onChangeState(event.nativeEvent);
  },

  _onChangeQuality: function (event) {
    return this.props.onChangeQuality && this.props.onChangeQuality(event.nativeEvent);
  },

  _onError: function (event) {
    return this.props.onError && this.props.onError(event.nativeEvent);
  },

  render() {
    var style = flattenStyle([styles.base, this.props.style]);

    var nativeProps = merge(this.props, {
      style,
      onYoutubeVideoReady: this._onReady,
      onYoutubeVideoChangeState: this._onChangeState,
      onYoutubeVideoChangeQuality: this._onChangeQuality,
      onYoutubeVideoError: this._onError,
    });

    /*
     * Try to use `playerParams` instead of settings `playsInline` and 
     * `videoId` individually.
     */
    if (this._exportedProps) {
      if (this._exportedProps.playerParams) {
        nativeProps.playerParams = {
          videoId: this.props.videoId,
        };
        delete nativeProps.videoId;

        if (this.props.playsInline) {
          nativeProps.playerParams.playerVars = {
            playsinline: 1
          };

          delete nativeProps.playsInline;
        };
      };
    } else {
      /*
       * For compatibility issues with an older version where setting both 
       * `playsInline` and `videoId` in quick succession would cause the video
       * to sometimes not play.
       */
      delete nativeProps.playsInline;
    }

    return <RCTYouTube {... nativeProps} />;
  },
});

var RCTYouTube = requireNativeComponent('RCTYouTube', null);

var styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

module.exports = YouTube;
