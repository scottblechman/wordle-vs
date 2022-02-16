interface GameRequest {
  userId: string,
  userName: string
}

class UserDocument {
  // Array of lobbies the user is in
  lobbies: string[];

  // 4-digit ID number for username uniqueness
  lobbyId: string;

  // Username
  name: string;

  // UIDs of users who have sent a request to play
  receivedRequests: GameRequest[];

  // UIDs of users a request to play has been sent to
  sentRequests: GameRequest[];

  // Auth UID
  uid: string;

  // ID of this document in Firestore
  userDocId: string;

  constructor (lobbies: string[], lobbyId: string, name: string, receivedRequests: GameRequest[], sentRequests: GameRequest[], uid: string, userDocId: string ) {
    this.lobbies = lobbies;
    this.lobbyId = lobbyId;
    this.name = name;
    this.receivedRequests = receivedRequests;
    this.sentRequests = sentRequests;
    this.uid = uid;
    this.userDocId = userDocId;
  }

  toString() {
      return `${this.name}#${this.lobbyId}`;
  }
}

const userConverter = {
  toFirestore: (user: UserDocument) => {
      return {
        lobbies: user.lobbies,
        lobbyId: user.lobbyId,
        name: user.name,
        receivedRequests: user.receivedRequests,
        sentRequests: user.sentRequests,
        uid: user.uid,
        userDocId: user.userDocId
      };
  },
  fromFirestore: (snapshot: { data: (arg0: any) => any; }, options: any) => {
      const data = snapshot.data(options);
      return new UserDocument(data.lobbies, data.lobbyId, data.name, data.receivedRequests, data.sentRequests, data.uid, data.userDocId);
  }
};

export type { GameRequest };
export { UserDocument, userConverter };
