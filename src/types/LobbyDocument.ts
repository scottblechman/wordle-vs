interface Player {
  playerDocId: string,
  playerName: string
}

class LobbyDocument {
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

  constructor (players: Player[], activePlayer: number, gameId: string, playerId: string, lobbyDocId: string) {
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

  /**
   * Updates a player name
   * @param userId userDocId of the user to change
   * @param username the new username
   */
  updateName(userId: string, username: string) {
    const index = this.players[0].playerDocId === userId ? 0 : 1;
    this.players[index].playerName = username;
  }
}

const lobbyConverter = {
  toFirestore: (lobby: LobbyDocument) => {
      return {
        players: lobby.players,
        activePlayer: lobby.activePlayer,
        gameId: lobby.gameId,
        playerId: lobby.playerId,
        lobbyDocId: lobby.lobbyDocId
      };
  },
  fromFirestore: (snapshot: { data: (arg0: any) => any; }, options: any) => {
      const data = snapshot.data(options);
      return new LobbyDocument(data.players, data.activePlayer, data.gameId, data.playerId, data.lobbyDocId);
  }
};

export { LobbyDocument, lobbyConverter };
