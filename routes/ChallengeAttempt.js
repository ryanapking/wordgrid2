import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import {
  consumeSquare,
  removeSquare,
  clearConsumedSquares,
  playWord,
} from "../data/redux/challengeData";
import { startChallenge, placePieceThenSave } from "../data/redux/thunkedChallengeActions";

import PieceOverlay from '../components/presentation/PieceOverlay';
import SpellWordSection from "../components/presentation/SpellWordSection";
import BoardDrawLetterGrid from "../components/presentation/BoardDrawLetterGrid";
import BoardPathCreator from "../components/presentation/BoardPathCreator";
import DrawPieceSection from "../components/presentation/DrawPieceSection";
import BoardTouchView from '../components/containers/BoardTouchView';
import ChallengePieceSetDisplay from "../components/presentation/ChallengePieceSetDisplay";

const ChallengeAttempt = () => {
  const dispatch = useDispatch();
  const [challenge, display] = useSelector(state => [state.challengeData.challenge, state.gameDisplay], shallowEqual);

  // trigger a new challenge attempt if needed
  useEffect(() => {
    if (!challenge || challenge.gameOver) dispatch(startChallenge());
  }, []);

  if (!challenge) return null;

  // zindex doesn't work on android. must move the overlay before or after the other elements, depending on need.
  const pieceOverlay =
    <PieceOverlay
      pointerEvents={'none'}
      boardRows={challenge.rows}
      placePiece={(pieceIndex, rowRef, columnRef) => dispatch(placePieceThenSave(pieceIndex, rowRef, columnRef)) }
    />;

  return (
    <View style={styles.container}>
      { challenge.word ? null : pieceOverlay }
      <View style={styles.underlay}>
        <View style={styles.info}>
          <View style={[styles.equal, styles.column]}>
            <Text style={[styles.equal, styles.textCenter]}>{ challenge.score } points</Text>
            <Text style={[styles.equal, styles.textCenter]}>{ 5 - challenge.moves.length } moves remaining</Text>
            <Text style={[styles.equal, styles.textCenter]}>{ challenge.word ? "place a piece" : "spell a word" }</Text>
          </View>
          <View style={styles.equal}>
            <ChallengePieceSetDisplay
              consumedSquares={challenge.consumedSquares}
              pieceSet={challenge.pieceSet}
              word={challenge.word}
            />
          </View>
        </View>
        <BoardTouchView
          style={styles.board}
          rows={challenge.rows}
          pointerEventsDisabled={challenge.word.length > 0}
          consumedSquares={challenge.consumedSquares}
          consumeSquare={(square) => dispatch(consumeSquare(square)) }
          removeSquare={() => dispatch(removeSquare()) }
          clearConsumedSquares={() => dispatch(clearConsumedSquares()) }
        >
          <BoardDrawLetterGrid
            boardState={challenge.rows}
            boardSize={display.boardLocation.width}
            consumedSquares={challenge.consumedSquares}
            hoveredSquares={display.hoveredSpaces}
          />
          <BoardPathCreator squares={challenge.consumedSquares} boardLocation={display.boardLocation}/>
        </BoardTouchView>
        <View style={styles.interaction}>
          { challenge.movePhase === "spell" ?
            <SpellWordSection
              displayPieces={challenge.pieces}
              consumedSquares={challenge.consumedSquares}
              clearConsumedSquares={ () => dispatch(clearConsumedSquares()) }
              playWord={ () => dispatch(playWord()) }
            />
            : null
          }
          { challenge.movePhase === "place" ?
            <DrawPieceSection pieces={challenge.pieces} allowDrag />
            : null
          }
          { challenge.movePhase === "complete" ?
            <Text>Game Over</Text>
            : null
          }
        </View>
      </View>
      { challenge.word ? pieceOverlay : null }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // display: 'flex',
    // flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  underlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 4,
    display: 'flex',
    flexDirection: 'row',
  },
  board: {
    flex: 14,
  },
  interaction: {
    flex: 5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  equal: {
    flex: 1,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  textCenter: {
    textAlign: 'center',
  },
});

export default ChallengeAttempt;