import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

type SurveyStorage = typeof import('./surveyStorage');

const loadPage = async (): Promise<SurveyStorage> => {
    vi.resetModules();
    return import('./surveyStorage');
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const INTERACTIONS_RAW_KEY =
    ':feedback-module-survey-interactions:v1:localStorage:v2';
const IMPRESSIONS_RAW_KEY =
    ':feedback-module-survey-impressions:v1:localStorage:v2';
const OCCURRENCES_RAW_KEY =
    ':feedback-module-survey-occurrences:v1:localStorage:v2';

const seedRaw = (key: string, value: unknown) =>
    window.localStorage.setItem(key, JSON.stringify({ value, expiry: null }));

const interactWithMany = (storage: SurveyStorage, count: number) => {
    for (let index = 1; index <= count; index++) {
        storage.recordSurveyInteraction(`survey-${index}`);
    }
};

describe('surveyStorage', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('remembers an interaction across page loads', async () => {
        const firstPage = await loadPage();
        expect(firstPage.hasInteractedWithSurvey('survey-a')).toBe(false);

        firstPage.recordSurveyInteraction('survey-a');

        const nextPage = await loadPage();
        expect(nextPage.hasInteractedWithSurvey('survey-a')).toBe(true);
        expect(nextPage.hasInteractedWithSurvey('survey-b')).toBe(false);
    });

    test('keeps the grace period for 7 days after an interaction', async () => {
        const storage = await loadPage();
        expect(storage.isInSurveyGracePeriod()).toBe(false);

        storage.recordSurveyInteraction('survey-a');

        vi.advanceTimersByTime(SEVEN_DAYS_MS - 1);
        expect(storage.isInSurveyGracePeriod()).toBe(true);

        vi.advanceTimersByTime(2);
        expect(storage.isInSurveyGracePeriod()).toBe(false);
    });

    test('starts the grace period without an interaction', async () => {
        const storage = await loadPage();

        storage.startSurveyGracePeriod();

        expect(storage.isInSurveyGracePeriod()).toBe(true);
        expect(storage.hasInteractedWithSurvey('survey-a')).toBe(false);
    });

    test('counts one impression per page load', async () => {
        const firstPage = await loadPage();
        for (let render = 0; render < 5; render++) {
            firstPage.recordSurveyImpression('survey-a');
        }

        expect(firstPage.surveyImpressionCount('survey-a')).toBe(1);

        const secondPage = await loadPage();
        secondPage.recordSurveyImpression('survey-a');
        secondPage.recordSurveyImpression('survey-a');

        expect(secondPage.surveyImpressionCount('survey-a')).toBe(2);
        expect(secondPage.surveyImpressionCount('survey-b')).toBe(0);
    });

    test('forgets the oldest interaction once 50 are remembered', async () => {
        const storage = await loadPage();
        interactWithMany(storage, 50);
        expect(storage.hasInteractedWithSurvey('survey-1')).toBe(true);

        storage.recordSurveyInteraction('survey-51');

        expect(storage.hasInteractedWithSurvey('survey-1')).toBe(false);
        expect(storage.hasInteractedWithSurvey('survey-51')).toBe(true);
    });

    test('remembers a survey interacted with twice only once', async () => {
        const storage = await loadPage();
        interactWithMany(storage, 50);

        storage.recordSurveyInteraction('survey-50');

        expect(storage.hasInteractedWithSurvey('survey-1')).toBe(true);
    });

    test('counts the occurrences of each survey across page loads', async () => {
        const firstPage = await loadPage();
        firstPage.recordSurveyOccurrence('survey-a');
        firstPage.recordSurveyOccurrence('survey-a');

        const nextPage = await loadPage();
        nextPage.recordSurveyOccurrence('survey-a');

        expect(nextPage.surveyOccurrenceCount('survey-a')).toBe(3);
        expect(nextPage.surveyOccurrenceCount('survey-b')).toBe(0);
    });

    test('treats corrupted storage as empty', async () => {
        seedRaw(INTERACTIONS_RAW_KEY, { 'survey-a': true });
        seedRaw(IMPRESSIONS_RAW_KEY, { 'survey-a': '5' });
        seedRaw(OCCURRENCES_RAW_KEY, { 'survey-a': '5' });

        const storage = await loadPage();

        expect(storage.hasInteractedWithSurvey('survey-a')).toBe(false);
        expect(storage.surveyImpressionCount('survey-a')).toBe(0);
        expect(storage.surveyOccurrenceCount('survey-a')).toBe(0);
    });

    test('replaces corrupted storage when the user interacts with a survey', async () => {
        seedRaw(INTERACTIONS_RAW_KEY, { 'survey-a': true });
        const storage = await loadPage();

        storage.recordSurveyInteraction('survey-b');

        expect(storage.hasInteractedWithSurvey('survey-b')).toBe(true);
    });
});
