import { useContext, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FirebaseContext } from '../../../App';
import { UserDocument } from '../../../types/UserDocument';
import { updateUsername } from '../../../util';
import './SettingsComponent.css';

interface SettingsComponentProps {
  open: boolean,
  setOpen: any,
  user: UserDocument
}

function SettingsComponent(props: SettingsComponentProps) {

  const firebase = useContext(FirebaseContext);

  const [username, setUsername] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    Modal.setAppElement('#root');
  }, []);

  useEffect(() => {
    if (!username) {
      setUsername(props.user.name);
    }
  }, [props.user.name, username]);

  const modalStyle = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

  const save = () => {
    (async function () {
      if (username && username !== props.user.name) {
        const err = await updateUsername(username ?? '', props.user, firebase.db);
        setError(err ?? '');
        if (!err) {
          props.setOpen(false);
        }
      }
    })();
  };
  
  return (
    <Modal
        isOpen={props.open}
        onRequestClose={() => props.setOpen(false)}
        style={modalStyle}
        contentLabel='Settings'
      >
        <h3>Settings</h3>
        <h5>Username</h5>
        <input type='text' value={username} onChange={(e) => setUsername(e.target.value)}/>
        <h5 className='error'>{error}</h5>
        <div className='button-row'>
          <div className='button-group'>
            <button onClick={() => props.setOpen(false)}>Cancel</button>
            <button onClick={save} disabled={username === undefined || username === props.user.name}>Save</button>
          </div>
        </div>
      </Modal>
  );
}

export default SettingsComponent;
