import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    hasSeenSurvey,
    isInSurveyGracePeriod,
    hasReachedImpressionCap,
    markSurveySeen,
    recordSurveyShown,
} from './seenSurveys.ts';

const GRACE_RAW_KEY = ':uxtweak-survey-grace:v1:localStorage:v2';
const IMPRESSIONS_RAW_KEY = ':uxtweak-survey-impressions:v1:localStorage:v2';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const seedRaw = (key: string, value: unknown, expiry?: number) =>
    localStorage.setItem(key, JSON.stringify({ value, expiry }));

describe('survey grace period', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('is not in effect on a fresh browser', () => {
        expect(isInSurveyGracePeriod()).toBe(false);
    });

    it('starts when a survey is marked seen', () => {
        markSurveySeen('sv_grace');
        expect(isInSurveyGracePeriod()).toBe(true);
    });

    it('ends seven days after the survey was concluded', () => {
        vi.useFakeTimers();
        try {
            markSurveySeen('sv_grace');
            vi.advanceTimersByTime(7 * ONE_DAY_MS - 1);
            expect(isInSurveyGracePeriod()).toBe(true);
            vi.advanceTimersByTime(2);
            expect(isInSurveyGracePeriod()).toBe(false);
        } finally {
            vi.useRealTimers();
        }
    });

    it('ends when the stored marker expires', () => {
        seedRaw(GRACE_RAW_KEY, 'active', Date.now() - 1);
        expect(isInSurveyGracePeriod()).toBe(false);
    });

    it('fails open on malformed grace storage', () => {
        seedRaw(GRACE_RAW_KEY, { at: 12345 });
        expect(isInSurveyGracePeriod()).toBe(false);
    });
});

describe('seen surveys', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('marking a new survey seen does not forget earlier ones', () => {
        markSurveySeen('sv_first');
        markSurveySeen('sv_second');
        expect(hasSeenSurvey('sv_first')).toBe(true);
    });
});

describe('survey impression cap', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('records at most one impression per survey per page load', () => {
        recordSurveyShown('imp_once');
        recordSurveyShown('imp_once');
        expect(
            JSON.parse(localStorage.getItem(IMPRESSIONS_RAW_KEY) ?? '{}').value,
        ).toEqual(['imp_once']);
    });

    it('caps a survey only once it reaches the maximum', () => {
        seedRaw(IMPRESSIONS_RAW_KEY, [
            'imp_under',
            'imp_under',
            'imp_at',
            'imp_at',
            'imp_at',
        ]);
        expect(hasReachedImpressionCap('imp_under')).toBe(false);
        expect(hasReachedImpressionCap('imp_at')).toBe(true);
    });

    it('treats malformed impression storage as zero impressions', () => {
        seedRaw(IMPRESSIONS_RAW_KEY, 'nope');
        expect(hasReachedImpressionCap('imp_bad')).toBe(false);

        seedRaw(IMPRESSIONS_RAW_KEY, { imp_bad: 3 });
        expect(hasReachedImpressionCap('imp_bad')).toBe(false);
    });
});
