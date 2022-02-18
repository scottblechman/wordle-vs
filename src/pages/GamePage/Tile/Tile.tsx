import LetterState from '../LetterState';
import './Tile.css';

interface TileProps {
  letter: string,
  solveState: LetterState | undefined
}

function Tile(props: TileProps) {

  const getStyle = () => {
    if (props.solveState === undefined) {
      return (props.letter === '') ? 'tile-unfilled' : 'tile-filled';
    }
  
    switch (props.solveState) {
      case LetterState.WrongLetter:
        return 'wrong-letter';
      case LetterState.WrongPosition:
          return 'wrong-position';
      case LetterState.Correct:
        return 'correct';
    }
  }

  return (
    <div className={`tile ${getStyle()}`}>
      {props.letter}
    </div>
  );
}

export default Tile;
