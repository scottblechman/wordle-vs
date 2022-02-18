import { signOut } from 'firebase/auth';
import { useContext, useEffect, useRef, useState } from 'react';
import { FirebaseContext } from '../../App';
import { UserDocument } from '../../types/UserDocument';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import './Header.css';
import { LeftArrowIcon, SettingsIcon } from '../../assets';

interface HeaderProps {
  user: UserDocument,
  lobbyId: string,
  returnToLobby: any,
}

function Header(props: HeaderProps) {

  const firebase = useContext(FirebaseContext);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    }

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    }
}, [dropdownRef]);

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
      <h4>WORDLE VS</h4>
      <div className='dropdown' ref={dropdownRef}>
        <div className='icon-container'onClick={() => setDropdownVisible(!dropdownVisible)}>
          <SettingsIcon />
        </div>
        {dropdownVisible && <div className='dropdown-content'>
          <p>Signed in as</p>
          <CopyToClipboard text={props.user.name !== undefined ? `${props.user.name}#${props.user.lobbyId}` : ''}>
            <h5>{props.user.toString()}</h5>
          </CopyToClipboard>
          <p className='signout' onClick={onSignOut}>Sign out</p>
        </div>}
      </div>
    </div>
  );
}

export default Header;
