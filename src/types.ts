export interface Submission {
  team: string;
  name: string;
  score: number;
  time: string;
  rawTime: number;
}

export interface LeaderboardEntry extends Submission {
  rank: number;
}

export interface EvaluationResult {
  accuracy: number;
  totalEntries: number;
  correctEntries: number;
}
