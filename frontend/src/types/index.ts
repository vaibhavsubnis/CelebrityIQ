export interface Celebrity {
  id: string;
  name: string;
  dateOfBirth: string;
  nationality: string;
  fieldOfExpertise: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyChallengeResponse {
  challengeId: string;
  celebrityId: string;
  imageUrl: string;
  initialTileIndex: number;
  date: string;
}

export interface GuessRequest {
  celebrityId: string;
  guess: string;
  tilesRevealed: number;
}

export interface GuessResponse {
  correct: boolean;
  pointsAwarded: number;
  celebrityName: string | null;
  nationality: string | null;
  fieldOfExpertise: string | null;
  dateOfBirth: string | null;
  gameOver: boolean;
}

export type RootTabParamList = {
  Game: undefined;
  Admin: undefined;
};

export type AdminStackParamList = {
  AdminList: undefined;
  AdminEdit: { celebrity?: Celebrity };
};
