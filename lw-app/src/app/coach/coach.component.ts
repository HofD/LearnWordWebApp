import { AfterViewChecked, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { I18nService } from '../i18n/i18n.service';
import { CoachHttpService } from './coach.http.service';
import { CoachAnalysis, CoachAnswer, CoachExercise, CoachIntervention } from './coach.models';

@Component({
  selector: 'app-coach', standalone: true, imports: [CommonModule],
  templateUrl: './coach.component.html', styleUrl: './coach.component.css'
})
export class CoachComponent implements OnChanges, OnDestroy, AfterViewChecked {
  @Input({ required: true }) sessionId = '';
  @ViewChild('activeHeading') private activeHeading?: ElementRef<HTMLElement>;
  @ViewChild('coachHeading') private coachHeading?: ElementRef<HTMLElement>;
  analysis: CoachAnalysis | null = null;
  loading = false;
  analysisError = false;
  actionError = false;
  busy = false;
  activeId: string | null = null;
  feedback: CoachAnswer | null = null;
  private requests = new Subscription();
  private pollCount = 0;
  private focusActive = false;
  private focusCoach = false;
  private exerciseShownAt = 0;
  pendingAnswer: { exerciseId: string; optionId: string; responseTimeMs: number } | null = null;

  constructor(private coach: CoachHttpService, public i18n: I18nService) {}

  ngOnChanges() {
    this.requests.unsubscribe();
    this.requests = new Subscription();
    this.analysis = null;
    this.loading = false;
    this.analysisError = false;
    this.focusActive = false;
    this.focusCoach = false;
    this.activeId = null;
    this.feedback = null;
    this.pendingAnswer = null;
    this.actionError = false;
    this.busy = false;
    if (this.sessionId) this.analyze();
  }
  ngOnDestroy() { this.requests.unsubscribe(); }
  ngAfterViewChecked() {
    if (this.focusCoach && this.coachHeading) {
      this.focusCoach = false;
      this.coachHeading.nativeElement.focus();
    }
    if (this.focusActive && this.activeHeading) {
      this.focusActive = false;
      this.activeHeading.nativeElement.focus();
    }
  }

  get interventions() { return this.analysis?.interventions.filter(item => item.status !== 'Dismissed') ?? []; }
  get visible() { return this.loading || this.analysisError || (this.analysis?.status === 'Completed' && this.interventions.length > 0); }
  get active() { return this.analysis?.interventions.find(item => item.id === this.activeId) ?? null; }
  get exercise(): CoachExercise | null {
    const active = this.active;
    if (!active || active.type !== 'ExtraPractice') return null;
    if (this.feedback) return active.exercises.find(item => item.id === this.feedback?.exerciseId) ?? null;
    return active.exercises.find(item => !item.answered) ?? null;
  }
  answeredCount(item: CoachIntervention) { return item.exercises.filter(exercise => exercise.answered).length; }
  correctCount(item: CoachIntervention) { return item.exercises.filter(exercise => exercise.answered && exercise.correct).length; }
  observation(item: CoachIntervention) {
    return this.analysis?.observations.find(observation => observation.cardId === item.cardId)?.explanation ?? '';
  }

  analyze() {
    if (this.loading) return;
    this.loading = true;
    this.analysisError = false;
    this.pollCount = 0;
    this.requests.add(this.coach.analyze(this.sessionId, this.i18n.language()).subscribe({
      next: result => this.receiveAnalysis(result), error: () => this.failAnalysis()
    }));
  }
  private receiveAnalysis(result: CoachAnalysis) {
    this.analysis = result;
    if (result.status === 'Pending') {
      // A second request can encounter the first request's persisted pending state.
      // Bound waiting and cancel it when the completion screen is left.
      if (++this.pollCount > 15) { this.failAnalysis(); return; }
      this.requests.add(timer(2000).subscribe(() => {
        this.requests.add(this.coach.analysis(this.sessionId).subscribe({
          next: response => this.receiveAnalysis(response), error: () => this.failAnalysis()
        }));
      }));
      return;
    }
    this.loading = false;
    this.analysisError = result.status === 'Failed';
  }
  private failAnalysis() { this.loading = false; this.analysisError = true; }

  open(item: CoachIntervention) {
    if (this.busy || !['Suggested', 'Accepted'].includes(item.status)) return;
    this.actionError = false;
    this.feedback = null;
    this.pendingAnswer = null;
    this.busy = true;
    this.requests.add(this.coach.accept(item.id).subscribe({
      next: result => { this.busy = false; this.replace(result); this.show(result); },
      error: error => this.failAction(item, error)
    }));
  }
  dismiss(item: CoachIntervention) {
    if (this.busy) return;
    this.busy = true;
    this.actionError = false;
    this.requests.add(this.coach.dismiss(item.id).subscribe({
      next: result => { this.busy = false; this.replace(result); this.close(); },
      error: error => this.failAction(item, error)
    }));
  }
  complete(item: CoachIntervention) {
    if (this.busy) return;
    this.busy = true;
    this.actionError = false;
    this.requests.add(this.coach.complete(item.id).subscribe({
      next: result => { this.busy = false; this.replace(result); this.close(); },
      error: error => this.failAction(item, error)
    }));
  }
  choose(optionId: string) {
    const exercise = this.exercise;
    if (!exercise || this.busy || this.feedback || this.pendingAnswer) return;
    this.pendingAnswer = { exerciseId: exercise.id, optionId,
      responseTimeMs: Math.min(600000, Math.max(0, Math.round(performance.now() - this.exerciseShownAt))) };
    this.retryAnswer();
  }
  retryAnswer() {
    const item = this.active;
    const answer = this.pendingAnswer;
    if (!item || !answer || this.busy) return;
    this.busy = true;
    this.actionError = false;
    this.requests.add(this.coach.answer(item.id, answer.exerciseId,
      { optionId: answer.optionId, responseTimeMs: answer.responseTimeMs }).subscribe({
      next: result => {
        this.busy = false;
        this.pendingAnswer = null;
        this.replace(result.intervention);
        this.feedback = result;
        this.focusActive = true;
      }, error: error => this.failAction(item, error)
    }));
  }
  nextExercise() {
    this.feedback = null;
    this.exerciseShownAt = performance.now();
    this.focusActive = true;
  }
  close() {
    if (this.busy) return;
    this.activeId = null;
    this.feedback = null;
    this.pendingAnswer = null;
    this.actionError = false;
    this.focusCoach = true;
  }
  private show(item: CoachIntervention) {
    if (item.status !== 'Accepted') return;
    this.activeId = item.id;
    this.exerciseShownAt = performance.now();
    this.focusActive = true;
  }
  private replace(item: CoachIntervention) {
    if (!this.analysis) return;
    this.analysis = { ...this.analysis, interventions: this.analysis.interventions.map(current => current.id === item.id ? item : current) };
  }
  private failAction(item: CoachIntervention, error: { status?: number }) {
    this.busy = false;
    this.actionError = true;
    if (error.status === 404 || error.status === 409 || error.status === 410) {
      // Re-read current status after revision/deletion or another tab's lifecycle change.
      this.requests.add(this.coach.intervention(item.id).subscribe({
        next: current => {
          this.replace(current);
          if (['Stale', 'Unavailable', 'Dismissed'].includes(current.status)) this.close();
        }, error: () => { this.replace({ ...item, status: 'Unavailable' }); this.close(); }
      }));
    }
  }
}
