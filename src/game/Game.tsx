import { useState, useEffect, useContext } from 'react';
import Board from './Board/Board';
import Keyboard from './Keyboard/Keyboard';

import './Game.css';
import LetterState from './LetterState';
import updateKeyStates from './getKeyStates';
import { GameDocument } from '../types/GameDocument';
import Settings from '../types/Settings';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FirebaseContext } from '../App';
import Modal from 'react-modal';
import { lobbyConverter } from '../types/LobbyDocument';
import words from 'an-array-of-english-words';

interface GameProps {
  game: GameDocument | undefined,
  gameId: string,
  lobbyId: string,
  settings: Settings,
  observer: boolean,
  setGameId: any,
}

function Game(props: GameProps) {

  const firebase = useContext(FirebaseContext);

  const [target, setTarget] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [attempt, setAttempt] = useState('');
  const [keyStates, setKeyStates] = useState<{ [letter: string]: LetterState | undefined }>({}); 

  useEffect(() => {
    Modal.setAppElement('#root');
  }, []);

  useEffect(() => {
    setTarget(props.game?.target ?? '');
    setAttempts(props.game?.attempts ?? []);

    const newStates = updateKeyStates(props.game?.target ?? '', props.game?.attempts ?? []);
    setKeyStates(newStates);
  }, [props.game]);

  const submitGuess = async (word: string) => {
    if (attempts.length < props.settings.maxAttempts && props.gameId !== '') {
      const newAttempts = attempts.concat(word);
      await updateAttempts(newAttempts);
    }
  };

  const updateAttempts = async (newAttempts: string[]) => {
    await updateDoc(doc(firebase.db, 'games', props.gameId ?? ''), {
      attempts: newAttempts
    });
  };

  const addLetter = (letter: string) => {
    if (attempt.length < 5) {
      setAttempt(attempt + letter);
    }
  };

  const backspace = () => {
    if (attempt.length > 0) {
      const newAttempt = attempt.substring(0, attempt.length - 1);
      setAttempt(newAttempt);
    }
  };

  const enter = async () => {
    const submission = attempt;
    const isWord = words.filter(d => new RegExp(submission.toLowerCase()).test(d)).filter(r => r === submission.toLowerCase()).length > 0;
    if (isWord) {
      setAttempt('');
      await submitGuess(submission);
    }
  };

  const afterOpenModal = () => {
    // references are now sync'd and can be accessed.
    //subtitle.style.color = '#f00';
  };

  
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

  const newGame = () => {
    (async function () {
      if (props.lobbyId !== '') {
        const lobbyRef = doc(firebase.db, 'lobbies', props.lobbyId).withConverter(lobbyConverter);
        const lobbySnap = await getDoc(lobbyRef);
        //const lobbyPlayerId = lobbySnap.data()?.playerId;
        //const lobbyCreatorId = lobbySnap.data()?.creatorId;
        //const lobbyResponderId = lobbySnap.data()?.responderId;

        const activePlayer = lobbySnap.data()?.activePlayer ?? 0;
        await updateDoc(lobbyRef, {
          gameId: '',
          //playerId: (lobbyPlayerId === lobbyCreatorId ? lobbyResponderId : lobbyCreatorId)
          activePlayer: activePlayer === 0 ? 1 : 0
        });
        //props.setGameId(undefined);
      }
    })();
  };

  return (
    <div>
      <div className='frame'>
        <div>
          {props.game === undefined && <h4>Waiting for game to start&hellip;</h4>}
          <Board target={target} attempts={attempts} attempt={attempt} settings={props.settings}/>
          {props.game !== undefined && <Keyboard addLetter={addLetter} backspace={backspace} enter={enter} letterStates={keyStates} observer={props.observer} />}
        </div>
      </div>
      <Modal
        isOpen={!props.observer && ((attempts.filter(a => a === target).length > 0) || ((attempts.filter(a => a === target).length === 0) && attempts.length === 6))}
        onAfterOpen={afterOpenModal}
        onRequestClose={newGame}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <h2>You {(attempts.filter(a => a === target).length > 0) ? 'won' : 'lost'}</h2>
        <button onClick={newGame}>New Game</button>
      </Modal>
    </div>
  );
}

export default Game;
