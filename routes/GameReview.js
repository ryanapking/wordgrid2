import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useSelector, shallowEqual } from 'react-redux';
import { ListItem } from 'react-native-elements';

import {
  remoteToLocal,
  moveRemoteToLocal,
  remoteToStartingGameState,
  arrayToString,
} from "../data/utilities/functions/dataConversions";
import { solveBoard } from "../data/board-solver";
import { useAsyncFetcher } from "../hooks/useAsyncFetcher";
import { useParams } from "../hooks/tempReactRouter";
import { applyMove, } from '../data/utilities/functions/applyMoves';
import { getGameSourceData } from "../data/parse-client/getters";

import MeasureView from "../components/MeasureView";
import BoardDrawLetterGrid from '../components/BoardDrawLetterGrid';
import BoardPathCreator from "../components/BoardPathCreator";
import DrawScoreBoard from "../components/GameScoreBoard";

const GameReview = () => {
  const params = useParams();
  const { gameID } = params;
  const uid = useSelector(state => state.user.uid, shallowEqual);

  const availableMovesRef = useRef(null);

  const [gameSource] = useAsyncFetcher(getGameSourceData, {gameID});

  const [moveIndex, setMoveIndex] = useState(0);
  const [reviewResults, setReviewResults] = useState({});
  const [displayPath, setDisplayPath] = useState([]);
  const [boardSize, setBoardSize] = useState({});

  const [game, startingGameState] = useMemo(() => {
    if (!gameSource || !uid) return [null, null];
    return [
      remoteToLocal(gameSource, uid),
      remoteToStartingGameState(gameSource, uid)
    ];
  }, [gameSource, uid]);

  // calculate review object and set
  useEffect(() => {
    if (!game || !startingGameState || !uid) return;

    // reset review results
    setReviewResults({});

    // scroll to the top
    if (availableMovesRef.current) {
      availableMovesRef.current.scrollTo({y: 0, animated: false});
      availableMovesRef.current.flashScrollIndicators();
    }

    // calculate board state for the given moveIndex
    const { moves } = game;

    let currentGameState = startingGameState;
    for (let i = 0; i < moveIndex; i++) {
      currentGameState = applyMove(currentGameState, moveRemoteToLocal(moves[i]));
    }

    const move = moveRemoteToLocal(moves[moveIndex]);

    const boardString = arrayToString(currentGameState.boardState);

    setReviewResults({
      displayingGameState: currentGameState,
      playerMovePath: move.wordPath,
      boardSolution: solveBoard(boardString),
    });

  }, [moveIndex, game, startingGameState, uid]);

  if (!reviewResults.displayingGameState) return null;

  const move = game.moves[moveIndex];
  const boardState = reviewResults.displayingGameState.boardState;
  const moveInning = Math.floor((moveIndex) / 2);
  const moveLabel = (move.p === uid) ? "Your move:" : "Their move:";
  const hideNextButton = (moveIndex >= game.moves.length - 1);
  const hidePrevButton = (moveIndex <= 0);

  return (
    <View style={styles.reviewContainer}>

      <View style={styles.boardSection}>
        <MeasureView
          style={styles.board}
          onMeasure={(x, y, width, height) => setBoardSize({width, height, rowHeight: height / 10, columnWidth: width / 10 }) }
        >
          <BoardDrawLetterGrid
            boardState={boardState}
            boardSize={boardSize.width}
            consumedSquares={displayPath}
          />
          <BoardPathCreator squares={displayPath} boardLocation={boardSize}/>
        </MeasureView>
      </View>

      <View style={styles.changeMovesSection}>
        <View>
          { hidePrevButton ? null :
            <Text style={styles.changeMove} onPress={() => setMoveIndex(currentMoveIndex => currentMoveIndex - 1)}>Prev</Text>
          }
        </View>
        <View>
          { hideNextButton ? null :
            <Text style={styles.changeMove} onPress={() => setMoveIndex(currentMoveIndex => currentMoveIndex + 1)}>Next</Text>
          }
        </View>
      </View>

      <View style={styles.availableMovesSection}>
        <ScrollView ref={availableMovesRef}>

          <ListItem
            title={ moveLabel }
            rightTitle={ move.wv + " points" }
            containerStyle={styles.divider}
          />
          <TouchableWithoutFeedback onPressIn={() => setDisplayPath(reviewResults.playerMovePath)} onPressOut={() => setDisplayPath([])}>
            <ListItem
              title={ move.w.toUpperCase() }
              rightTitle={
                <DrawScoreBoard
                  p1={game.p1}
                  p2={game.p2}
                  uid={uid}
                  currentPlayerScoreBoard={game.currentPlayer.scoreBoard}
                  opponentScoreBoard={game.opponent.scoreBoard}
                  highlight={{player: move.p, inning: moveInning}}
                />
              }
            />
          </TouchableWithoutFeedback>

          <ListItem
            title="Most Valuable Words"
            rightTitle={ reviewResults.boardSolution.highestValue + " points" }
            containerStyle={styles.divider}
          />
          {reviewResults.boardSolution.mostValuableWords.map( (word, index) =>
            <TouchableWithoutFeedback
              key={index}
              onPressIn={() => setDisplayPath(word.path) }
              onPressOut={() => setDisplayPath([])}
            >
              <ListItem title={ word.string.toUpperCase() } />
            </TouchableWithoutFeedback>
          )}

          <ListItem
            title="Longest Words"
            rightTitle={ reviewResults.boardSolution.longestLength + " letters"}
            containerStyle={styles.divider}
          />
          {reviewResults.boardSolution.longestWords.map( (word, index) =>
            <TouchableWithoutFeedback
              key={index}
              onPressIn={() => setDisplayPath(word.path)}
              onPressOut={() => setDisplayPath([])}
            >
              <ListItem title={ word.string.toUpperCase() } />
            </TouchableWithoutFeedback>
          )}

          <ListItem
            title="All Available Words"
            rightTitle={ reviewResults.boardSolution.wordCount + " words" }
            containerStyle={styles.divider}
          />
          {reviewResults.boardSolution.allWords.map( (word, index) =>
            <TouchableWithoutFeedback
              key={index}
              onPressIn={() => setDisplayPath(word.path) }
              onPressOut={() => setDisplayPath([]) }
            >
              <ListItem title={ word.string.toUpperCase() } rightTitle={ word.value + " points" } />
            </TouchableWithoutFeedback>
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
    flex: 42,
  },
  changeMovesSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 8,
  },
  availableMovesSection: {
    flex: 50,
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
  },
  changeMove: {
    padding: 10
  },
  playerMove: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    backgroundColor: 'lightgray',
  }
});

export default GameReview;