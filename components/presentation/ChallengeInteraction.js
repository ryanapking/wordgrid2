import React from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import DrawPieceSection from "../containers/DrawPieceSection";
import { calculateWordValue } from "../../data/utilities/functions/calculations";
import { playWord, clearConsumedSquares } from '../../data/redux/challengeData';

const ChallengeInteraction = props => {
  const challenge = useSelector(state => state.challengeData.challenge, shallowEqual);
  const dispatch = useDispatch();

  const { word } = challenge;
  const wordPlayed = !!word;

  const gameOver = () => {
    return (
      <View style={[styles.gameOver, props.style]}>
        <Text>Game Over</Text>
      </View>
    );
  };

  const playWordInteraction = () => {
    const displayWord = challenge.consumedSquares.reduce( (word, square) => word + square.letter, "");
    const longEnough = (displayWord.length >= 4);
    const startMessage = "Drag to spell a word";
    return (
      <View style={props.style}>
        <View style={[styles.flex]}>
          <DrawPieceSection style={[styles.twoColumns]} pieces={challenge.pieces} />
          <View style={styles.twoColumns}>
            <TouchableOpacity style={styles.wordDisplaySection} onPress={ () => dispatch(clearConsumedSquares()) } >
              <Text>{displayWord ? displayWord : startMessage}</Text>
              { displayWord.length > 0 &&
              <Text style={styles.clearMessage}>(tap to clear word)</Text>
              }
            </TouchableOpacity>
            { longEnough &&
            <Button
              title={`Play word for ${calculateWordValue(displayWord)} points`}
              onPress={ () => dispatch(playWord()) }
            />
            }
          </View>
        </View>
      </View>
    );
  };

  const placePieceInteraction = () => {
    return (
      <View style={props.style}>
        <DrawPieceSection pieces={challenge.pieces} allowDrag />
      </View>
    );
  };

  if (challenge.gameOver) {
    return gameOver();
  } else if (!wordPlayed) {
    return playWordInteraction();
  } else {
    return placePieceInteraction();
  }
};

const styles = StyleSheet.create({
  flex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  twoColumns: {
    flexBasis: '50%',
    flex: 1,
    maxHeight: '100%',
    maxWidth: '100%',
  },
  gameOver: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordDisplaySection: {
    alignItems: 'center',
    padding: 20,
    textAlign: 'center',
  },
  clearMessage: {
    opacity: .2,
  },
});

export default ChallengeInteraction;