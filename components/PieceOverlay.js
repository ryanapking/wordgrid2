import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import Piece from "./Piece";

class PieceOverlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      offsetX: 0,
      offsetY: 0,
    }
  }

  render() {
    const { pieceLocations } = this.props;
    const pieceIndexes = Object.keys(this.props.pieceLocations);

    let locations = {};

    pieceIndexes.forEach( (pieceIndex) => {
      const loc = pieceLocations[pieceIndex];
      locations[pieceIndex] = {
        top: loc.pageY - this.state.offsetY,
        left: loc.pageX - this.state.offsetX,
        width: loc.width,
        height: loc.height,
        position: 'absolute',
      }
    });

    return (
      <View style={[styles.overlay, this.props.style]}
        ref={baseView => this.baseView = baseView}
        onLayout={ () => this._onLayout() }
      >
        { pieceIndexes.map( (pieceIndex) =>
          <View key={pieceIndex} style={[locations[pieceIndex], styles.pieceBackground]} />
        )}
        { pieceIndexes.map( (pieceIndex) =>
          <Piece
            key={pieceIndex}
            piece={pieceLocations[pieceIndex].piece}
            style={locations[pieceIndex]}
            allowDrag={true}
            baseSize={pieceLocations[pieceIndex].width}
            boardRows={this.props.boardRows}
            placePiece={(rowRef, columnRef) => this.props.placePiece(pieceIndex, rowRef, columnRef)}
          />
        )}
      </View>
    );
  }

  _onLayout() {
    this.baseView.measure( (x, y, width, height, pageX, pageY) => {
      this.setState({
        offsetX: pageX,
        offsetY: pageY,
      })
    })
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    // backgroundColor: 'green',
  },
  pieceBackground: {
    backgroundColor: 'gray',
  }
});

const mapStateToProps = (state) => {
  return {
    pieceLocations: state.gameDisplay.pieceLocations
  }
};

export default connect(mapStateToProps)(PieceOverlay);