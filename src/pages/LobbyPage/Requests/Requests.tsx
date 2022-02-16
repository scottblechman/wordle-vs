import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useContext } from 'react';
import { FirebaseContext } from '../../../App';
import { lobbyConverter, LobbyDocument } from '../../../types/LobbyDocument';
import { userConverter, UserDocument } from '../../../types/UserDocument';
import './Requests.css';

interface RequestsProps {
  user: UserDocument,
  type: 'received' | 'sent',
  setLobby: React.Dispatch<React.SetStateAction<string | undefined>>,
}

function Requests(props: RequestsProps) {

  const firebase = useContext(FirebaseContext);

  const accept = (senderId: string, senderName: string) => {
    (async function () {
      // Remove the request before adding lobby
      reject(senderId);


      const newLobbyRef = doc(collection(firebase.db, 'lobbies')).withConverter(lobbyConverter);
      // make this user the active player, since the next action is to start a game
      const lobby = new LobbyDocument([{playerDocId: senderId, playerName: senderName.split('#')[0]}, {playerDocId: props.user.userDocId, playerName: props.user.name}], 0, '', senderId, newLobbyRef.id);
      await setDoc(newLobbyRef, lobby);
      await updateLobbies(senderId, newLobbyRef.id);
      await updateLobbies(props.user.userDocId, newLobbyRef.id);
      props.setLobby(newLobbyRef.id);
    })();
  }

  const reject = (senderId: string) => {
    (async function () {
      // remove the user's id from the sender's request list
      await updateSender(props.user.userDocId, senderId);

      // remove the sending user from this user's request list
      await updateReceiver(props.user.userDocId, senderId);
    })();
  }

  const cancel = (receiverId: string) => {
    (async function () {
      // remove the user's id from the receiver's request list
      await updateReceiver(receiverId, props.user.userDocId);

      // remove the requested user from this user's request list 
      await updateSender(receiverId, props.user.userDocId);
    })();
  };

  /**
   * Removes the sender from the receiver's received requests.
   * @param receiverId receiving user doc ID
   * @param senderId user doc ID
   */
  const updateReceiver = async (receiverId: string, senderId: string) => {
    const docRef = doc(firebase.db, 'users', receiverId).withConverter(userConverter);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const newRequests = docSnap.data().receivedRequests.filter(r => r.userId !== senderId);
      await updateDoc(docRef, {
        receivedRequests: newRequests
      });
    } else {
      console.log(`Error updating received requests: could not find user with ID ${receiverId}.`);
    }
  };

  /**
   * Removes the requested user from the user's sent requests.
   * @param receiverId receiving user doc ID
   * @param senderId user doc ID
   */
  const updateSender = async (receiverId: string, senderId: string) => {
    const docRef = doc(firebase.db, 'users', senderId).withConverter(userConverter);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const newRequests = docSnap.data().sentRequests.filter(r => r.userId !== receiverId);
      await updateDoc(docRef, {
        sentRequests: newRequests
      });
    } else {
      console.log(`Error updating sent requests: could not find user with ID ${senderId}.`);
    }
  };

  /**
   * Adds the lobby ID to the user's lobby list
   * @param userId user doc ID
   * @param lobbyId lobby doc ID
   */
  const updateLobbies = async (userId: string, lobbyId: string) => {
    const docRef = doc(firebase.db, 'users', userId).withConverter(userConverter);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const newLobbies = docSnap.data().lobbies;
      newLobbies.push(lobbyId);
      await updateDoc(docRef, {
        lobbies: newLobbies
      });
    } else {
      console.log('Error updating user lobbies: could not find user.');
    }
  };

  return (
    <div className='requests'>
      <h5>{props.type === 'received' ? 'New' : 'Sent'} Requests</h5>
      {props.type === 'received' && props.user.receivedRequests.map(r => <div className='request' key={r.userId}>
        <p>{r.userName}</p>
        <div className='buttons' id='multiple'>
        <div onClick={() => accept(r.userId, r.userName)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div onClick={() => reject(r.userId)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>)}
      {props.type === 'sent' && props.user.sentRequests.map(r => <div className='request' key={r.userId}>
        <p>{r.userName}</p>
        <div className='buttons'>
          <div onClick={() => cancel(r.userId)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>)}
    </div>
  );
}

export default Requests;
