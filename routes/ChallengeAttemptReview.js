import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useSelector, shallowEqual } from 'react-redux';
import { ListItem } from 'react-native-elements';

import { useAsyncFetcher } from "../hooks/useAsyncFetcher";
import { useParams } from "../hooks/tempReactRouter";
import { getAttemptByChallengeIDAndIndex } from "../data/async-storage/challengeAttempts";
import { getAttemptByID, getChallengeByID } from "../data/parse-client/getters";
import { challengeAttemptToReviewObject } from "../data/utilities/functions/dataConversions";

import PieceDrawLetterGrid from "../components/PieceDrawLetterGrid";
import MeasureView from "../components/MeasureView";
import BoardDrawLetterGrid from '../components/BoardDrawLetterGrid';
import BoardPathCreator from '../components/BoardPathCreator';

const ChallengeAttemptReview = () => {
  const params = useParams();
  const { attemptID, challengeID, attemptIndex } = params;
  const userID = useSelector(state => state.user.uid, shallowEqual);

  // sometimes we want a local attempt
  // sometimes we want a remote attempt
  // this is probably not a great way to manage this
  let getAttemptFunction, getAttemptParams;
  if (attemptID) {
    getAttemptFunction = getAttemptByID;
    getAttemptParams = {attemptID};
  } else if (attemptIndex) {
    getAttemptFunction = getAttemptByChallengeIDAndIndex;
    getAttemptParams = {userID, challengeID, attemptIndex};
  }

  const [currentMove, setCurrentMove] = useState({moveIndex: 0, phaseIndex: 0});
  const [boardLocation, setBoardLocation] = useState({});
  const [attempt] = useAsyncFetcher(getAttemptFunction, getAttemptParams);
  const [challenge] = useAsyncFetcher(getChallengeByID, {challengeID});

  const reviewObject = useMemo(() => {
    if (!attempt || !challenge) return null;
    return challengeAttemptToReviewObject(challenge, attempt);
  }, [attempt, challenge]);

  // this is what we're actually displaying at any given moment
  const [boardState, highlightPath, wordPath] = useMemo(() => {
    if (!reviewObject) return [null, null, null];
    const reviewing = reviewObject[currentMove.moveIndex];

    let boardState = reviewing.initialState.boardState;
    let highlightPath = [];
    let wordPath = [];

    if (currentMove.phaseIndex === 0) {
      wordPath = reviewing.wordPath;
      highlightPath = reviewing.wordPath;
    } else if (currentMove.phaseIndex === 1) {
      boardState = reviewing.thirdState.boardState;
      highlightPath = reviewing.pieceBoardSquares;
    }

    return [boardState, highlightPath, wordPath];

  }, [reviewObject, currentMove]);

  if (!boardState) return null;

  // this is dumb
  const pieceSize = boardLocation ? boardLocation.width * .12 : null;

  return (
    <View style={styles.reviewContainer}>

      <View style={styles.boardSection}>
        <MeasureView
          style={styles.board}
          onMeasure={(x, y, width, height) => setBoardLocation({width, height, rowHeight: height / 10, columnWidth: width / 10 }) }
        >
          <BoardDrawLetterGrid
            boardState={boardState}
            boardSize={boardLocation.width}
            consumedSquares={highlightPath}
          />
          <BoardPathCreator squares={wordPath} boardLocation={boardLocation} />
        </MeasureView>
      </View>

      <View style={styles.movesSection}>
        <ScrollView>
          <ListItem title="Moves" containerStyle={styles.divider} />
          {reviewObject.map( (move, index) =>
            <View key={index}>
              <TouchableWithoutFeedback onPressIn={() => setCurrentMove({ moveIndex: index, phaseIndex: 0 })} >
                <ListItem
                  containerStyle={(currentMove.moveIndex === index && currentMove.phaseIndex === 0) ? {backgroundColor: 'lightcoral'} : {}}
                  title={ move.word.toUpperCase() }
                  rightTitle={ move.wordValue + " points"}
                />
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPressIn={() => setCurrentMove({ moveIndex: index, phaseIndex: 1 })} >
                <ListItem
                  containerStyle={(currentMove.moveIndex === index && currentMove.phaseIndex === 1) ? {backgroundColor: 'lightcoral'} : {}}
                  title={
                    <View style={styles.gamePieceContainer}>
                      <PieceDrawLetterGrid
                        style={styles.gamePiece}
                        piece={move.piece}
                        pieceSize={pieceSize}
                      />
                    </View>
                  }
                  rightTitle={ move.placementValue + " points"}
                />
              </TouchableWithoutFeedback>
            </View>
          )}
        </ScrollView>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  boardSection: {
    display: 'flex',
    alignItems: 'center',
    flex: 3,
  },
  movesSection: {
    flex: 2,
  },
  board: {
    maxWidth: '100%',
    maxHeight: '100%',
    aspectRatio: 1,
  },
  spaceBetween: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 0,
    paddingLeft: 15,
  },
  gamePieceContainer: {
    // flex: 1,
    // margin: 2,
    // display: 'flex',
    // flexDirection: 'column',
    // justifyContent: 'center',
    // maxHeight: '100%',
    // maxWidth: '100%',
    width: '20%',
    aspectRatio: 1,
  },
  gamePiece: {
    backgroundColor: 'gray',
    maxWidth: '100%',
    maxHeight: '100%',
    aspectRatio: 1,
  },
  divider: {
    backgroundColor: 'lightgray',
  }
});

export default ChallengeAttemptReview;