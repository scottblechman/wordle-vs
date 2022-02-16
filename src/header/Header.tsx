import { signOut } from 'firebase/auth';
import { useContext, useState } from 'react';
import { FirebaseContext } from '../App';
import { UserDocument } from '../types/UserDocument';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import './Header.css';
import { LeftArrowIcon, SettingsIcon } from '../assets';

interface HeaderProps {
  user: UserDocument,
  lobbyId: string,
  returnToLobby: any,
}

function Header(props: HeaderProps) {

  const firebase = useContext(FirebaseContext);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const onSignOut = () => {
    signOut(firebase.auth).then(() => {
      console.log('signed out');
    }).catch((error) => {
      console.log(`error signing out - ${error}`);
    });
  };

  return (
    <div className='header'>
      <div className='icon-container' onClick={props.returnToLobby}>
        {props.lobbyId !== '' ? <LeftArrowIcon /> : <div className='icon' />}
      </div>
      <CopyToClipboard text={props.user.name !== undefined ? `${props.user.name}#${props.user.lobbyId}` : ''}>
        <p>{props.user.name !== undefined ? `Logged in as ${props.user.name}#${props.user.lobbyId}` : ''}</p>
      </CopyToClipboard>
      <div className={'dropdown'}>
        <div className='icon-container' tabIndex={0} onClick={() => {const v = dropdownVisible; setDropdownVisible(!v)}} onBlur={() => setDropdownVisible(false)}>
          <SettingsIcon />
        </div>
        <div className={`dropdown-content ${dropdownVisible ? 'visible' : 'hidden'}`}>
          <p className='signout' onClick={onSignOut}>Sign out</p>
        </div>
      </div>
    </div>
  );
}

export default Header;
