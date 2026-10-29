import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface LearningCard {
  id: number;
  collectionId: number;
  words: Array<{ id: number; value: string; transcription: string; translation: string }>;
  learnt: boolean;
  dueDate?: string | null;
  intervalDays?: number | null;
  easeFactor?: number | null;
  reviewCount?: number | null;
  lastReviewedAt?: string | null;
}

export interface TodayPlan {
  totalCount: number;
  estimatedMinutes: number;
  groups: { due: number; weak: number; new: number };
  cards: LearningCard[];
}

export interface LearnerSummary {
  new: number;
  learning: number;
  weak: number;
  strong: number;
  totalCardsStudied: number;
  attemptsCount: number;
  recentAttemptsCount: number;
}

export interface LearningSession {
  id: string;
  collectionId: number;
  startedAt: string;
  completedAt: string | null;
  plannedCardsCount: number;
  completedCardsCount: number;
  successfulReviews: number;
  failedReviews: number;
  cards: LearningCard[];
}

@Injectable({ providedIn: 'root' })
export class LearningHttpService {
  private readonly base = `${environment.apiUrl}/api/learning`;
  constructor(private http: HttpClient) {}

  today(collectionId: number) {
    return this.http.get<TodayPlan>(`${this.base}/collections/${collectionId}/today`);
  }

  summary(collectionId: number) {
    return this.http.get<LearnerSummary>(`${this.base}/collections/${collectionId}/summary`);
  }

  start(collectionId: number) {
    return this.http.post<LearningSession>(`${this.base}/collections/${collectionId}/sessions`, {});
  }

  complete(sessionId: string) {
    return this.http.post<LearningSession>(`${this.base}/sessions/${sessionId}/complete`, {});
  }
}
