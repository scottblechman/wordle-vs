import { collection, doc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { FirebaseContext } from '../../../App';
import { LobbyDocument } from '../../../types/LobbyDocument';
import { userConverter, UserDocument } from '../../../types/UserDocument';
import './SendRequest.css';

interface SendRequestProps {
  user: UserDocument,
  lobbies: LobbyDocument[]
}

function SendRequest(props: SendRequestProps) {

  const firebase = useContext(FirebaseContext);

  const [searchName, setSearchName] = useState<string>('');
  const [error, setError] = useState<string | undefined>(undefined);

  const checkErrors = (): string | undefined => {
    if (searchName === undefined) {
      return 'Please enter a user ID.';
    } else if ((searchName.match(/\w+#\d+/g)||[]).length === 0) {
      return 'Improperly formatted user ID.';
    } else if (searchName === props.user.toString()) {
      return 'Can\'t send a request to yourself.';
    } else if (props.user.sentRequests.filter(r => r.userName === searchName).length > 0) {
      return 'Already sent this user a request.';
    } else if (props.user.receivedRequests.filter(r => r.userName === searchName).length > 0) {
      return 'You have a request from this user.';
    } else if (props.lobbies.filter(l => l.getOpponentName(props.user.userDocId) === searchName).length > 0) {
      return 'Already in a game with this user.';
    }
    return undefined;
  }

  const sendRequest = async () => {
    let err = checkErrors();
    let requestedUser: UserDocument | undefined = undefined;
    if (err === undefined) {
      // Get user to request
      const toks = searchName.split('#');
      const userQuery = query(collection(firebase.db, 'users').withConverter(userConverter), where('name', '==', toks[0]), where('lobbyId', '==', toks[1]), limit(1));
      const userQuerySnapshot = await getDocs(userQuery);
      if (userQuerySnapshot.empty) {
        err = 'User does not exist';
      } else {
        requestedUser = userQuerySnapshot.docs[0].data();
      }
    }
    setError(err);
    if (requestedUser !== undefined) {
      setSearchName('');
      // Update user's received requests with uid
      const reqs = requestedUser?.receivedRequests;
      reqs.push({ userId: props.user.userDocId, userName: props.user.toString()});
      await updateDoc(doc(firebase.db, 'users', requestedUser.userDocId), {
        receivedRequests: reqs
      });

      // Update sent requests with user's id
      const newSentRequests = props.user.sentRequests;
      newSentRequests.push({userId: requestedUser.userDocId, userName: requestedUser.toString()});
      updateDoc(doc(firebase.db, 'users', props.user.userDocId), {
        sentRequests: newSentRequests
      });
    }
  };
  
  return (
    <div className='find-user-container'>
      <div className='find-user-form'>
        <input className='find-user-input' type='text' onChange={(e) => setSearchName(e.target.value)} value={searchName}/>
        <button className='find-user-submit' onClick={sendRequest}>INVITE</button>
      </div>
      <h6 className='find-user-error'>{error ?? ''}</h6>
    </div>
  );
}

export default SendRequest;
