import compareLetter from './compareLetter';
import LetterState from './LetterState';

function updateKeyStates(target: string, atts: string[]) {
  const newStates: { [letter: string]: LetterState | undefined } = {};
  for (const character of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')) {
    newStates[character] = undefined;
  };

  for (const att of atts) {
    for (const index of [...Array(5).keys()]) {
      const char = att[index];
      const state = compareLetter(target, att, index);

      switch (state) {
        case LetterState.Correct:
          newStates[char] = LetterState.Correct;
          break;
        case LetterState.WrongPosition:
          if (newStates[char] !== LetterState.Correct) {
            newStates[char] = LetterState.WrongPosition
          }
          break;
        case LetterState.WrongLetter:
          if ((newStates[char] !== LetterState.Correct) && (newStates[char] !== LetterState.WrongPosition)) {
            newStates[char] = LetterState.WrongLetter
          }
          break;
        default:
          break;
      }
    }
  }

  return newStates;
}

export default updateKeyStates;