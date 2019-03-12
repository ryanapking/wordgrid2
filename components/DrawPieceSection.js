import React, { Component } from 'react';
import {StyleSheet, View} from 'react-native';
import { connect } from 'react-redux';

import Piece from './Piece';
import { setPieceLocation, clearPieceLocations } from "../data/redux/gameDisplay";

class DrawPieceSection extends Component {
  constructor() {
    super();

    this.state = {
      pieceLocations: {},
    };

    this.pieceViews = {};
  }

  render() {
    const { pieces, allowDrag } = this.props;
    return (
      <View style={[this.props.style, styles.container]}>
        { pieces.map( (piece, pieceIndex) => {
          const baseSize = this.state.pieceLocations[pieceIndex] ? this.state.pieceLocations[pieceIndex].width : 0;
          return (
            <View style={styles.gamePieceContainer} key={pieceIndex}>
              <View
                ref={pieceView => this.pieceViews[pieceIndex] = pieceView}
                onLayout={ () => this._onLayout(pieceIndex) }
                style={styles.gamePiece}
              >
                { allowDrag ? null : <Piece piece={piece} pieceIndex={pieceIndex} style={styles.gamePiece} allowDrag={allowDrag} baseSize={baseSize}/>}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  componentWillUnmount() {
    // if piece locations were set, clear them now
    const { allowDrag } = this.props;
    if (allowDrag) {
      this.props.clearPieceLocations();
    }
  }

  _onLayout(pieceIndex) {
    const { allowDrag } = this.props;
    this.pieceViews[pieceIndex].measure( (x, y, width, height, pageX, pageY) => {
      const pieceLocation = {x, y, width, height, pageX, pageY, piece: this.props.pieces[pieceIndex]};

      // local data is used for piece size calculations
      this.setState({
        pieceLocations: {
          ...this.state.pieceLocations,
          [pieceIndex]: pieceLocation,
        }
      });

      // set the piece location for the overlay
      if (allowDrag) {
        this.props.setPieceLocation(pieceIndex, pieceLocation);
      }
    });
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  gamePieceContainer: {
    flex: 1,
    margin: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxHeight: '100%',
    maxWidth: '100%',
  },
  gamePiece: {
    backgroundColor: 'gray',
    maxWidth: '100%',
    maxHeight: '100%',
    aspectRatio: 1,
  }
});

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {
  setPieceLocation,
  clearPieceLocations
};

export default connect(mapStateToProps, mapDispatchToProps)(DrawPieceSection);