import { useContext, useState } from 'react';
import words from 'an-array-of-english-words';
import './NewGamePage.css';
import Settings from '../../types/Settings';
import { FirebaseContext } from '../../App';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';

interface NewGamePageProps {
  settings: Settings,
  lobbyId: string | undefined,
  setLobbyId: React.Dispatch<React.SetStateAction<string | undefined>>,
  setGameId: React.Dispatch<React.SetStateAction<string | undefined>>
}

function NewGamePage(props: NewGamePageProps) {

  const firebase = useContext(FirebaseContext);

  const [word, setWord] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const trySubmit = () => {
    if (word.length !== props.settings.wordLength) {
      setError(`Word must be ${props.settings.wordLength} letters.`);
    } else {
      const matches = words.filter(d => new RegExp(word.toLowerCase()).test(d)).filter(r => r.length === 5);
      if (matches.length === 0) {
        setError('Not a word.');
      } else {
        setError(undefined);
        newGame(word);
      }
    }
  };

  const newGame = (word: string) => {
    (async function () {
      // Create game
      const newGameRef = doc(collection(firebase.db, 'games'));
      await setDoc(newGameRef, {
        target: word,
        attempts: [],
        gameId: newGameRef.id
      });
  
      // Add game ID to lobby
      await updateDoc(doc(firebase.db, 'lobbies', props.lobbyId ?? ''), {
        gameId: newGameRef.id
      });
  
      //props.setLobbyId(undefined);
      //props.setGameId(newGameRef.id);
    })();
  };

  return (
    <div className='newgame'>
      <h4 className='heading'>New Game</h4>
      <p>Enter a 5-letter word.</p>
      <input className='form' type='text' onChange={(e) => setWord(e.target.value.toUpperCase())}/>
      <h6>{error ?? ''}</h6>
      <button className='submit' onClick={trySubmit}>START</button>
    </div>
  );
}

export default NewGamePage;
