import Settings from '../../../types/Settings';
import Row from '../Row/Row';

import './Board.css';

interface BoardProps {
  target: string,
  attempts: string[],
  attempt: string,
  settings: Settings
}

function Board(props: BoardProps) {
  
  return (
    <div className='board'>
      {props.attempts.map((word, index) => {
        return <Row target={props.target} word={word} key={index}/>
      })}

      {props.attempts.length < props.settings.maxAttempts && <Row target={undefined} word={props.attempt}/>}

      {[...Array(Math.max(props.settings.maxAttempts - (props.attempts.length + 1), 0)).keys()].map((i) => {
        return <Row target={undefined} word={''} key={i}/>
      })}
    </div>
  );
}

export default Board;