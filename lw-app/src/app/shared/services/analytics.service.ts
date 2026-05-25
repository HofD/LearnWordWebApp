import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AnalyticsEventName } from './analytics-events';

type MetricaWindow = Window & {
    ym?: {
        (...args: unknown[]): void;
        a?: unknown[];
        l?: number;
    };
};

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    constructor(
        @Inject(PLATFORM_ID) private platformId: object
    ) { }

    start(): void {
        // The production counter is installed from index.prod.html.
    }

    hit(url: string): void {
        if (!this.canTrack()) {
            return;
        }

        (window as MetricaWindow).ym?.(environment.yandexMetricaCounterId, 'hit', url);
    }

    reachGoal(eventName: AnalyticsEventName, params: AnalyticsParams = {}): void {
        if (!this.canTrack()) {
            return;
        }

        (window as MetricaWindow).ym?.(environment.yandexMetricaCounterId, 'reachGoal', eventName, this.cleanParams(params));
    }

    private canTrack(): boolean {
        return isPlatformBrowser(this.platformId)
            && environment.production
            && Number.isFinite(environment.yandexMetricaCounterId)
            && environment.yandexMetricaCounterId > 0;
    }

    private cleanParams(params: AnalyticsParams): AnalyticsParams {
        return Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== null && value !== undefined)
        );
    }
}
