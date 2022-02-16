interface Player {
  playerDocId: string,
  playerName: string
}

class LobbyDocument {
  // userDocId of the lobby creator (one who sent the request)
  //creatorId: string;

  // Name of the lobby creator
  //creatorName: string;

  // userDocId of the lobby responder (one who received the request)
  //responderId: string;

  // Name of the lobby responder
  //responderName: string;

  // Players in the game
  players: Player[];

  // Index of players for the active player. This is the one who is solving a puzzle created by the other player
  activePlayer: number;

  // gameDocId of the active game; empty string if no game is active
  gameId: string;

  // userDocId of the user playing the current or most recent active game
  playerId: string;

  // ID of this document in Firestore
  lobbyDocId: string;

  constructor (/*creatorId: string, creatorName: string, responderId: string, responderName: string,*/ players: Player[], activePlayer: number, gameId: string, playerId: string, lobbyDocId: string) {
    //this.creatorId = creatorId;
    //this.creatorName = creatorName;
    //this.responderId = responderId;
    //this.responderName = responderName;
    this.players = players;
    this.activePlayer = activePlayer;
    this.gameId = gameId;
    this.playerId = playerId;
    this.lobbyDocId = lobbyDocId;
  }

  /**
   * Checks if the current user is the active player solving a puzzle.
   * @param userId userDocId of the checked user
   * @returns true if the active player's ID matches userId
   */
  isActivePlayer(userId: string) {
    return this.players[this.activePlayer].playerDocId === userId;
  }

  /**
   * Gets the name of the player in the lobby who is not the current user.
   * @param userId userDocId of the checked user
   * @returns name of the player opposite userId
   */
  getOpponentName(userId: string) {
    return this.players.filter(p => p.playerDocId !== userId)[0].playerName;
  }
}

const lobbyConverter = {
  toFirestore: (lobby: LobbyDocument) => {
      return {
        //creatorId: lobby.creatorId,
        //creatorName: lobby.creatorName,
        //responderId: lobby.responderId,
        //responderName: lobby.responderName,
        players: lobby.players,
        activePlayer: lobby.activePlayer,
        gameId: lobby.gameId,
        playerId: lobby.playerId,
        lobbyDocId: lobby.lobbyDocId
      };
  },
  fromFirestore: (snapshot: { data: (arg0: any) => any; }, options: any) => {
      const data = snapshot.data(options);
      return new LobbyDocument(/*data.creatorId, data.creatorName, data.responderId, data.responderName,*/ data.players, data.activePlayer, data.gameId, data.playerId, data.lobbyDocId);
  }
};

export { LobbyDocument, lobbyConverter };
