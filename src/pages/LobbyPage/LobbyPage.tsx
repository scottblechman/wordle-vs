import { collection, getDocs, query, where } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { FirebaseContext } from '../../App';
import { lobbyConverter, LobbyDocument } from '../../types/LobbyDocument';
import { UserDocument } from '../../types/UserDocument';
import Lobby from './Lobby/Lobby';
import './LobbyPage.css';
import Requests from './Requests/Requests';
import SendRequest from './SendRequest/SendRequest';

interface LobbyPageProps {
  uid: string | null | undefined,
  user: UserDocument,
  setLobby: React.Dispatch<React.SetStateAction<string | undefined>>,
}

function LobbyPage(props: LobbyPageProps) {

  const firebase = useContext(FirebaseContext);

  const [lobbies, setLobbies] = useState<LobbyDocument[] | undefined>(undefined);

  // populate lobbies based on lobby doc IDs in user object
  useEffect(() => {
    let newLobbies: LobbyDocument[] = [];
    (async function () {
      if (props.user.lobbies.length > 0) {
        const q = query(collection(firebase.db, 'lobbies').withConverter(lobbyConverter), where('lobbyDocId', 'in', props.user.lobbies));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          newLobbies.push(doc.data());
        });
      }
      setLobbies(newLobbies);
    })();
  }, [firebase.db, props.user.lobbies]);

  const hasLobbies = () => {
    return (lobbies ?? []).length > 0;
  };

  const hasReceivedRequests = () => {
    return props.user.receivedRequests.length > 0;
  };

  const hasSentRequests = () => {
    return props.user.sentRequests.length > 0;
  };

  const hasLobbiesOrRequests = () => { 
    return (hasLobbies() || hasReceivedRequests() || hasSentRequests());
  };
  
  return (
    <div className='lobbies'>
      {hasLobbiesOrRequests() && <div>
        {hasReceivedRequests() && <Requests user={props.user} type={'received'} setLobby={props.setLobby} />}
        {hasSentRequests() && <Requests user={props.user} type={'sent'} setLobby={props.setLobby} />}
        {hasLobbies() && <div>
          <h4>OPPONENTS</h4>
          {(lobbies ?? []).map((lobby, index) => {
            return <div key={index} onClick={() => props.setLobby(lobby.lobbyDocId)}><Lobby lobby={lobby} userDocId={props.user.userDocId} /></div>})}
        </div>}
      </div>}
      {!hasLobbiesOrRequests() && <div className='null-state'>
        <div>
          <h2>You're not playing with anyone right now.</h2>
          <p>To start a game, enter a user's ID.</p>
        </div>
      </div>}
      <SendRequest user={props.user} lobbies={lobbies ?? []} />
    </div>
  );
}

export default LobbyPage;
