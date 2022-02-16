class GameDocument {

  // Guessed words in order of submission
  attempts: string[];

  // The correct word
  target: string;

  constructor (attempts: string[], target: string) {
    this.attempts = attempts;
    this.target = target;
  }
}

const gameConverter = {
  toFirestore: (game: GameDocument) => {
      return {
        attempts: game.attempts,
        target: game.target
      };
  },
  fromFirestore: (snapshot: { data: (arg0: any) => any; }, options: any) => {
      const data = snapshot.data(options);
      return new GameDocument(data.attempts, data.target);
  }
};

export { GameDocument, gameConverter };
