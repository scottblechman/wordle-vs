import { signOut } from 'firebase/auth';
import { useContext } from 'react';
import { FirebaseContext } from '../App';
import { UserDocument } from '../types/UserDocument';
import './Header.css';

interface HeaderProps {
  user: UserDocument,
  gameId: string | undefined,
  returnToLobby: any,
}

function Header(props: HeaderProps) {

  const firebase = useContext(FirebaseContext);

  const onSignOut = () => {
    signOut(firebase.auth).then(() => {
      console.log('signed out');
    }).catch((error) => {
      console.log(`error signing out - ${error}`);
    });
  };

  return (
    <div className='header'>
      <div onClick={props.returnToLobby}>
        <svg xmlns='http://www.w3.org/2000/svg' className='icon' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          {props.gameId !== '' && <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />}
        </svg>
      </div>
      <p onClick={onSignOut}>{props.user.name !== undefined ? `Logged in as ${props.user.name}#${props.user.lobbyId}` : ''}</p>
      <svg xmlns='http://www.w3.org/2000/svg' className='icon' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' />
      </svg>
    </div>
  );
}

export default Header;
