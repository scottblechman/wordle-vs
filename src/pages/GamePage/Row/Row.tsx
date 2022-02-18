import './Row.css';
import Tile from '../Tile/Tile';
import compareLetter from '../compareLetter';

interface RowProps {
  target: string | undefined,
  word: string
}

function Row(props: RowProps) {

  const wordLength = 5;

  return (
    <div className='row'>
      {props.word.split('').map((letter, index) => {
        return <Tile letter={letter} solveState={compareLetter(props.target, props.word, index)} key={index} />
      })}

      {[...Array(wordLength - (props.word.split('').length)).keys()].map((i) => {
        return <Tile letter={''} solveState={undefined} key={i}/>
      })}
    </div>
  );
}

export default Row;
