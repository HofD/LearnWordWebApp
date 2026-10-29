export type CoachInterventionStatus = 'Suggested' | 'Accepted' | 'Completed' | 'Dismissed' | 'Stale' | 'Unavailable';
export interface CoachObservation {
  cardId: number;
  learningRevision: number;
  type: string;
  evidenceSummary: string;
  explanation: string;
}
export interface CoachExercise {
  id: string;
  type: 'RecognitionChoice';
  prompt: string;
  options: Array<{ id: string; text: string }>;
  answered: boolean;
  correct?: boolean | null;
}
export interface CoachIntervention {
  id: string;
  analysisId: string;
  cardId: number;
  learningRevision: number;
  type: 'Explanation' | 'MicroLesson' | 'ExtraPractice';
  title: string;
  status: CoachInterventionStatus;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  lesson?: { explanation: string; examples: Array<{ source: string; target: string }>; tips: string[] } | null;
  exercises: CoachExercise[];
  evaluation: {
    status: 'Unknown' | 'NoFollowUpEvidence' | 'FollowUpSuccess' | 'FollowUpFailure';
    postInterventionAttempts: number;
    firstPostInterventionOutcome?: string | null;
    firstPostInterventionReviewedAt?: string | null;
  };
}
export interface CoachAnalysis {
  id: string;
  sessionId: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Disabled';
  decision: 'None' | 'Intervention';
  summary: string;
  failureCode?: string | null;
  provider: string;
  model: string;
  promptVersion: string;
  schemaVersion: number;
  createdAt: string;
  observations: CoachObservation[];
  interventions: CoachIntervention[];
}
export interface CoachAnswer {
  exerciseId: string;
  correct: boolean;
  explanation: string;
  intervention: CoachIntervention;
}
