import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getFirestore, limit, onSnapshot, query, setDoc, Unsubscribe, updateDoc, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, getRedirectResult, signInWithRedirect  } from 'firebase/auth';
import { useState, useEffect, useRef } from 'react';


import './App.css';
import Login from './login/Login';
import { LobbyPage, NewGamePage, GamePage } from './pages';
import { Header } from './components';
import { gameConverter, GameDocument } from './types/GameDocument';
import Settings from './types/Settings';
import React from 'react';
import { userConverter, UserDocument } from './types/UserDocument';
import { lobbyConverter, LobbyDocument } from './types/LobbyDocument';
import { createUsername } from './util';

initializeApp({
  apiKey: "AIzaSyDEycDoABJL76Fl2S4hiY5Rn8BSJ-y05cA",
  authDomain: "wordle-vs.firebaseapp.com",
  projectId: "wordle-vs",
  storageBucket: "wordle-vs.appspot.com",
  messagingSenderId: "583683273041",
  appId: "1:583683273041:web:2f2fe1178a09299e7da370"
});

const db = getFirestore();
const auth = getAuth();

const provider = new GoogleAuthProvider();
auth.useDeviceLanguage();

const settings: Settings = {
  'maxAttempts': 6,
  'wordLength': 5
};

const firebase = {
  f: {
    db: db,
    auth: auth
  }
};

export const FirebaseContext = React.createContext(firebase.f);

async function createNewUser (uid: string, refId: string) {
  const result = await getRedirectResult(auth);
  const { username, tag } = await createUsername(result?.user?.displayName, db);
  return new UserDocument([], tag, username, [], [], uid, refId);
}

function App() {

  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [user, setUser] = useState<UserDocument | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>(undefined);  // Tracks 
  const userUnsubscribe = useRef<Unsubscribe | undefined>(undefined);

  const [lobbyId, setLobbyId] = useState<string | undefined>(undefined);
  const [activeLobby, setActiveLobby] = useState<LobbyDocument | undefined>(undefined);
  const lobbyUnsubscribe = useRef<Unsubscribe | undefined>(undefined);

  const [gameId, setGameId] = useState<string | undefined>(undefined);
  const [game, setGame] = useState<GameDocument | undefined>(undefined);
  const gameUnsubscribe = useRef<Unsubscribe | undefined>(undefined);

  // app mount/unmount - set up auth listener, and remove any listeners on unmount
  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });

    return () => {
      authUnsubscribe();
      if (userUnsubscribe.current !== undefined) {
        userUnsubscribe.current();
      }
      if (gameUnsubscribe.current !== undefined) {
        gameUnsubscribe.current();
      }
    }
  }, []);

  // auth state change - set user based on current uid, creating a new one if needed
  useEffect(() => {
    const uidDef = uid ?? '';
    if (uidDef === '') {
      return;
    } else if (userUnsubscribe.current === undefined) {
      const userQuery = query(collection(db, 'users').withConverter(userConverter), where('uid', '==', uid), limit(1));
      userUnsubscribe.current = onSnapshot(userQuery, async (querySnapshot) => {
        if (querySnapshot.docs.length === 0) {
          const newUserRef = doc(collection(db, 'users')).withConverter(userConverter);
          const u = await createNewUser(uidDef, newUserRef.id);
          // We don't need setUser here, since setDoc invokes the callback and goes to the else branch.
          await setDoc(newUserRef, u);
        } else {
          querySnapshot.forEach((userDoc) => {
            setUser(userDoc.data());
            setUsername(userDoc.data().name);
          });
        }
      });
    }

    return () => {
      setUser(undefined);
      if (userUnsubscribe.current !== undefined) {
        userUnsubscribe.current();
        userUnsubscribe.current = undefined;
      }
    }
  }, [uid]);

  useEffect(() => {
    (async function () {
      if (user && user.name !== username && user.lobbies.length > 0) {
        const q = query(collection(db, 'lobbies').withConverter(lobbyConverter), where('lobbyDocId', 'in', user.lobbies));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (lobby) => {
          const newLobby = lobby.data();
          newLobby.updateName(user.userDocId, user.name);
          await updateDoc(doc(db, 'lobbies', lobby.data().lobbyDocId), {
            players: newLobby.players
          });
        });
      }
    })();
  }, [user, username]);

  // lobby selected/unselected - set active lobby listener
  useEffect(() => {
    const lobbyIdDef = lobbyId ?? '';
    if (lobbyIdDef === '') {
      return;
    } else if (lobbyUnsubscribe.current === undefined) {
      const lobbyQuery = query(collection(db, 'lobbies').withConverter(lobbyConverter), where('lobbyDocId', '==', lobbyIdDef), limit(1));
      lobbyUnsubscribe.current = onSnapshot(lobbyQuery, async (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          setActiveLobby(doc.data());
        });
      });
    }

    return () => {
      setActiveLobby(undefined);
      if (lobbyUnsubscribe.current !== undefined) {
        lobbyUnsubscribe.current();
        lobbyUnsubscribe.current = undefined;
      }
    }
  }, [lobbyId]);

  // lobby update - set game ID; will set as undefined automatically when lobby or game is cleared
  useEffect(() => {
    let gameIdDef = '';
    if (activeLobby !== undefined) {
      gameIdDef = activeLobby.gameId ?? '';
    }
    setGameId(gameIdDef !== '' ? gameIdDef : undefined);
  }, [activeLobby]);

  // game ID set/unset - set game listener
  useEffect(() => {
    const gameIdDef = gameId ?? '';
    if (gameIdDef === '') {
      return;
    } else if (gameUnsubscribe.current === undefined) {
      const gameQuery = query(collection(db, 'games').withConverter(gameConverter), where('gameId', '==', gameIdDef), limit(1));
      gameUnsubscribe.current = onSnapshot(gameQuery, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          setGame(doc.data());
        });
      });
    }

    return () => {
      setGame(undefined);
      if (gameUnsubscribe.current !== undefined) {
        gameUnsubscribe.current();
        gameUnsubscribe.current = undefined;
      }
    }
  }, [gameId]);

  /**
   * Gets the current page to show based on the navigation state:
   * - No page if user is undefined; should show LoginPage anyway
   * - LobbyPage: if no lobby is selected (activeLobby is undefined)
   * - NewGamePage: if a lobby is selected, no game is active (game is undefined), and user is not the active player (not solving)
   * - GamePage: if a lobby is selected and NewGamePage criteria not met
   * @returns page based on navigation state
   */
  const getContentPage = () => {
    if (user === undefined) {
      return <div></div>;
    }

    if (activeLobby === undefined) {
      return <LobbyPage user={user} uid={uid} setLobby={setLobbyId} />;
    } else {
      if (game === undefined && !activeLobby.isActivePlayer(user.userDocId)) {
        return <NewGamePage settings={settings} lobbyId={lobbyId} setLobbyId={setLobbyId} setGameId={setGameId} />;
      } else {
        return <GamePage game={game} gameId={gameId ?? ''} lobbyId={lobbyId ?? ''} settings={settings} observer={!activeLobby.isActivePlayer(user.userDocId)} setGameId={setGameId} />;
      }
    }
  };

  return (
    <FirebaseContext.Provider value={firebase.f}>
      {uid === null && <Login signIn={() => signInWithRedirect(auth, provider)} />}
      {user !== undefined && <div>
        <Header user={user} lobbyId={lobbyId ?? ''} returnToLobby={() => setLobbyId(undefined)} />
        {getContentPage()}
      </div>}
    </FirebaseContext.Provider>
  );
}

export default App;
