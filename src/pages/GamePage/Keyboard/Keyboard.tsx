import LetterState from '../LetterState';
import './Keyboard.css';

interface KeyboardProps {
  addLetter: any,
  backspace: any,
  enter: any,
  letterStates: { [letter: string]: LetterState | undefined },
  observer: boolean
}

function Keyboard(props: KeyboardProps) {

  const getButtonStyle = (letter: string, observer: boolean) => {
    if (props.letterStates[letter] === undefined) {
      return `${props.observer ? 'undefined-fg' : ''}`;
    }
    switch (props.letterStates[letter]) {
      case LetterState.Correct:
        return `correct ${props.observer ? 'correct-fg' : 'filled'}`;
      case LetterState.WrongPosition:
        return `wrong-position ${props.observer ? 'wrong-position-fg' : 'filled'}`;
      case LetterState.WrongLetter:
        return `wrong-letter ${props.observer ? 'wrong-letter-fg' : 'filled'}`;
      default:
        return `${props.observer ? 'undefined-fg' : ''}`;;
    }
  };

  interface ButtonProps {
    letter: string,
    observer: boolean
  };

  const Button = (buttonProps: ButtonProps) => {
    return <button className={getButtonStyle(buttonProps.letter, props.observer)} onClick={() => {if (!props.observer) {props.addLetter(buttonProps.letter)}}}>{buttonProps.letter}</button>
  }

  return (
    <div className='keyboard'>
      <div className='keyboard-row'>
        {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((letter, index) => {
          return <Button key={index} letter={letter} observer={props.observer} />
        })}
      </div>
      <div className='keyboard-row'>
        {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((letter, index) => {
          return <Button key={index} letter={letter} observer={props.observer} />
        })}
      </div>
      <div className='keyboard-row'>
        <button className={getButtonStyle('', props.observer)} onClick={() => {if (!props.observer) {props.enter()}}} id='enter'>ENTER</button>
        {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((letter, index) => {
          return <Button key={index} letter={letter} observer={props.observer} />
        })}
        <button className={getButtonStyle('', props.observer)} onClick={() => {if (!props.observer) {props.backspace()}}} id='backspace'>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon-back" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Keyboard;
