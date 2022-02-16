import LetterState from './LetterState';

function compareLetter(target: string | undefined, word: string, letterIndex: number) {
  if (target === undefined) {
    return undefined;
  }

  let targetLetters = [-1, -1, -1, -1, -1];
  const attemptLetters = [-1, -1, -1, -1, -1];

  for (let i = 0; i < targetLetters.length; i++) {
    if (target[i] === word[i]) {
      targetLetters[i] = i;
      attemptLetters[i] = i;
    }
  }

  for (let i = 0; i < attemptLetters.length; i++) {
    if (attemptLetters[i] === -1) {
      for (let j = 0; j < targetLetters.length; j++) {
        if (targetLetters[j] === -1 && target[j] === word[i]) {
          targetLetters[j] = j;
          attemptLetters[i] = j;
          j = targetLetters.length - 1;
        }
      }
    }
  }

  targetLetters = [0, 1, 2, 3, 4];

  if (attemptLetters[letterIndex] === -1) {
    return LetterState.WrongLetter;
  } else {
    return attemptLetters[letterIndex] === targetLetters[letterIndex] ? LetterState.Correct : LetterState.WrongPosition;
  }
}

export default compareLetter;
