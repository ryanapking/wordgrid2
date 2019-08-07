import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Button } from 'react-native';
import PropTypes from 'prop-types';

import { rowsArrayType, squaresArrayType } from "../proptypes";
import DrawPieceSection from "./DrawPieceSection";
import { calculateWordValue } from "../data/utilities/functions/calculations";

const SpellWordSection = props => {
  const { consumedSquares, displayPieces, playWord, clearConsumedSquares } = props;
  const displayWord = consumedSquares.reduce( (word, square) => word + square.letter, "");
  const longEnough = (displayWord.length >= 4);
  const startMessage = "Drag to spell a word";
  return (
    <View style={[styles.flex]}>
      <DrawPieceSection style={[styles.twoColumns]} pieces={displayPieces} />
      <View style={styles.twoColumns}>
        <TouchableOpacity style={styles.wordDisplaySection} onPress={ () => clearConsumedSquares() } >
          <Text>{displayWord ? displayWord : startMessage}</Text>
          { displayWord.length > 0 &&
            <Text style={styles.clearMessage}>(tap to clear word)</Text>
          }
        </TouchableOpacity>
        { longEnough &&
          <Button
            title={`Play word for ${calculateWordValue(displayWord)} points`}
            onPress={ () => playWord() }
          />
        }
      </View>
    </View>
  )
};

SpellWordSection.propTypes = {
  displayPieces: rowsArrayType.isRequired,
  consumedSquares: squaresArrayType.isRequired,
  clearConsumedSquares: PropTypes.func.isRequired,
  playWord: PropTypes.func.isRequired,
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
  wordDisplaySection: {
    alignItems: 'center',
    padding: 20,
    textAlign: 'center',
  },
  clearMessage: {
    opacity: .2,
  },
});

export default SpellWordSection;