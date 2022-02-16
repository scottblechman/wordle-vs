import { LobbyDocument } from '../../../types/LobbyDocument';
import './Lobby.css';

interface LobbyProps {
  lobby: LobbyDocument
  userDocId: string
}

function Lobby(props: LobbyProps) {

  const getStatusMessage = () => {
    if (props.lobby.gameId === '') {
      return props.lobby.isActivePlayer(props.userDocId) ? 'Waiting for game to start' : 'Start a new game';
    } else {
      return props.lobby.isActivePlayer(props.userDocId) ? 'Your move' : 'Their move';
    }
  };

  return (
    <div className='lobby'>
      <p className='lobby-opponent'>{props.lobby.getOpponentName(props.userDocId)}</p>
      <p className='lobby-status'>{getStatusMessage()}</p>
    </div>
  );
}

export default Lobby;
