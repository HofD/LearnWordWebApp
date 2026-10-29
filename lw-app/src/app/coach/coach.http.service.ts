import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { UiLanguage } from '../i18n/ui-text';
import { CoachAnalysis, CoachAnswer, CoachIntervention } from './coach.models';

@Injectable({ providedIn: 'root' })
export class CoachHttpService {
  private readonly base = `${environment.apiUrl}/api/learning`;
  constructor(private http: HttpClient) {}

  analyze(sessionId: string, language: UiLanguage) {
    return this.http.post<CoachAnalysis>(`${this.base}/sessions/${sessionId}/coach-analysis`, { language });
  }
  analysis(sessionId: string) {
    return this.http.get<CoachAnalysis>(`${this.base}/sessions/${sessionId}/coach-analysis`);
  }
  intervention(id: string) {
    return this.http.get<CoachIntervention>(`${this.base}/interventions/${id}`);
  }
  accept(id: string) { return this.action(id, 'accept'); }
  dismiss(id: string) { return this.action(id, 'dismiss'); }
  complete(id: string) { return this.action(id, 'complete'); }
  answer(id: string, exerciseId: string, answer: { optionId: string; responseTimeMs: number }) {
    return this.http.post<CoachAnswer>(`${this.base}/interventions/${id}/exercises/${exerciseId}/answer`, answer);
  }
  private action(id: string, action: string) {
    return this.http.post<CoachIntervention>(`${this.base}/interventions/${id}/${action}`, {});
  }
}
