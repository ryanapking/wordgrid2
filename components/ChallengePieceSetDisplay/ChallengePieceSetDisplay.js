import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import PropTypes from 'prop-types';

import { squaresArrayType } from "../../proptypes";
import DrawPieceSection from '../DrawPieceSection';

const ChallengePieceSetDisplay = props => {
  const { pieceSet, word, consumedSquares } = props;
  const scrollView = useRef(null);
  const pieceSectionContainer = useRef(null);
  const pieceSetArray = useMemo(() => Object.keys(pieceSet).map( (key) => pieceSet[key]), [pieceSet]);

  const scrollToPiece = (pieceSize) => {
    if (!pieceSectionContainer.current || !scrollView.current || !pieceSet) {
      return;
    }

    pieceSectionContainer.current.measure((x, y, width, height) => {
      // this nonsense gets us to the right piece index
      const scrollIndex = pieceSize - 5;

      // calculate piece size and x value to scroll to
      const pieceWidth = width / 13;
      const scrollToX = (scrollIndex * pieceWidth) + (pieceWidth / 2);

      scrollView.current.scrollTo({x: scrollToX});
    });

  };

  useEffect(() => {
    if (consumedSquares.length >= 4) {
      scrollToPiece(consumedSquares.length <= 16 ? consumedSquares.length : 16);
    }
  });

  if (!pieceSetArray.length || word) return null;

  return (
    <ScrollView
      style={styles.fullSize} horizontal={true} ref={scrollView}>
      <View style={styles.pieceSectionContainer} ref={pieceSectionContainer}>
        <DrawPieceSection pieces={pieceSetArray} allowDrag={false}/>
      </View>
    </ScrollView>
  );
};

ChallengePieceSetDisplay.propTypes = {
  consumedSquares: squaresArrayType.isRequired,
  pieceSet: PropTypes.object.isRequired,
  word: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  fullSize: {
    width: '100%',
    height: '100%',
  },
  pieceSectionContainer: {
    height: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    aspectRatio: 13,
  },
  gamePiece: {
    backgroundColor: 'gray',
    maxWidth: '100%',
    maxHeight: '100%',
    aspectRatio: 1,
  },
});

export default ChallengePieceSetDisplay;