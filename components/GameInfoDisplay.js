import React, { Component } from 'react';
import { withRouter } from 'react-router-native';
import { connect } from 'react-redux';
import { Text, StyleSheet, View } from "react-native";

import GamePhaseDisplay from "./GamePhaseDisplay";
import DrawPieceSection from "./DrawPieceSection";
import DrawScoreBoard from './DrawScoreBoard';

class GameInfoDisplay extends Component {
  render() {
    const { p1, p2, scoreBoard, them } = this.props.game;
    return(
      <View style={[this.props.style, styles.main]}>
        <View style={[styles.leftSide, {padding: 5}]}>
          <Text>Opponent Pieces:</Text>
          <DrawPieceSection pieces={them} allowDrag={false} />
        </View>
        <View style={[styles.rightSide, {padding: 5}]}>
          <DrawScoreBoard style={styles.scoreBoard} p1={p1} p2={p2} scoreBoard={scoreBoard}/>
          <GamePhaseDisplay style={styles.phaseDisplay} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    display: 'flex',
    flexDirection: 'row',
  },
  row: {
    flex: 1,
  },
  leftSide: {
    flex: 1,
  },
  rightSide: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  scoreBoard: {
    flex: 1,
  },
  phaseDisplay: {
    flex: 1,
  },
});

const mapStateToProps = (state, ownProps) => {
  const gameID = ownProps.match.params.gameID;
  return {
    game: state.gameData.byID[gameID],
  };
};

export default withRouter(connect(mapStateToProps)(GameInfoDisplay));