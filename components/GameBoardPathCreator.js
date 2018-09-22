import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import PropTypes from 'prop-types';

import GameBoardPath from './GameBoardPath';

class GameBoardPathCreator extends Component {
  render() {

    // split the consumedSquares into pairs, to allow a path section to be rendered
    const squarePairs = this.props.consumedSquares
    .map( (square, squareIndex, usedSquares) => {
      return usedSquares.slice(squareIndex - 1, squareIndex + 1);
    })
    .filter( (pair) => {
      return pair.length === 2;
    });

    return (
      <View style={styles.overlay} pointerEvents={'none'}>
        {squarePairs.map( (pair, pairIndex) =>
          <GameBoardPath key={pairIndex} square1={pair[0]} square2={pair[1]}/>
        )}
      </View>
    );
  }

}

const mapStateToProps = (state, ownProps) => {
  const gameID = ownProps.match.params.gameID;
  return {
    consumedSquares: state.gameData.byID[ownProps.match.params.gameID].consumedSquares
  }
};

const styles = StyleSheet.create({
  overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  }
});

export default withRouter(connect(mapStateToProps)(GameBoardPathCreator));