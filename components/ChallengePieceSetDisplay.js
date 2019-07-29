import React, { Component } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { connect } from 'react-redux';

import DrawPieceSection from './DrawPieceSection';

class ChallengePieceSetDisplay extends Component {
  componentDidUpdate() {
    const { consumedSquares } = this.props;

    if (consumedSquares.length >= 4) {
      const scrollToPiece = consumedSquares.length <= 16 ? consumedSquares.length : 16;
      this._scrollToPiece(scrollToPiece);
    }
  }

  render() {
    const { pieceSet, word } = this.props;

    if (!pieceSet || word) {
      return null;
    }

    const pieceSetArray = Object.keys(pieceSet).map( (key) => pieceSet[key]);

    return (
      <ScrollView
        style={styles.fullSize} horizontal={true} ref={(scrollView) => this.pieceSet = scrollView}>
        <View style={styles.pieceSectionContainer} ref={(view) => this.pieceSectionContainer = view}>
          <DrawPieceSection pieces={pieceSetArray} allowDrag={false}/>
        </View>
      </ScrollView>
    );
  }

  _scrollToPiece(pieceSize) {
    if (!this.pieceSectionContainer || !this.pieceSet) {
      console.log('guard triggered');
      return;
    }

    this.pieceSectionContainer.measure((x, y, width, height) => {
      // this nonsense gets us to the right piece index
      const scrollIndex = pieceSize - 5;

      // calculate piece size and x value to scroll to
      const pieceWidth = width / 13;
      const scrollToX = (scrollIndex * pieceWidth) + (pieceWidth / 2);

      this.pieceSet.scrollTo({x: scrollToX});
    });

  }
}

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

const mapStateToProps = (state) => {
  const { challenge } = state.challengeData;
  return {
    consumedSquares: challenge.consumedSquares,
    pieceSet: challenge.pieceSet,
    word: challenge.word,
  };
};

export default connect(mapStateToProps)(ChallengePieceSetDisplay);