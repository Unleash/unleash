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

const seedRaw = (key: string, value: unknown) =>
    window.localStorage.setItem(key, JSON.stringify({ value, expiry: null }));

const interactWithMany = (storage: SurveyStorage, count: number) => {
    for (let index = 1; index <= count; index++) {
        storage.recordSurveyInteraction(`survey-${index}`);
    }
};

const endGracePeriod = () => vi.advanceTimersByTime(SEVEN_DAYS_MS + 1);

describe('surveyStorage', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('never shows a survey again once the user interacted with it', async () => {
        const firstPage = await loadPage();
        expect(firstPage.shouldShowSurvey('survey-a')).toBe(true);

        firstPage.recordSurveyInteraction('survey-a');
        endGracePeriod();

        const nextPage = await loadPage();
        expect(nextPage.shouldShowSurvey('survey-a')).toBe(false);
        expect(nextPage.shouldShowSurvey('survey-b')).toBe(true);
    });

    test('shows no survey for 7 days after any interaction', async () => {
        const storage = await loadPage();

        storage.recordSurveyInteraction('survey-a');

        vi.advanceTimersByTime(SEVEN_DAYS_MS - 1);
        expect(storage.shouldShowSurvey('survey-b')).toBe(false);

        vi.advanceTimersByTime(2);
        expect(storage.shouldShowSurvey('survey-b')).toBe(true);
    });

    test('stops showing a survey after 3 impressions', async () => {
        for (let pageLoad = 1; pageLoad <= 3; pageLoad++) {
            const storage = await loadPage();
            expect(storage.shouldShowSurvey('survey-a')).toBe(true);
            storage.recordSurveyImpression('survey-a');
        }

        const storage = await loadPage();
        expect(storage.shouldShowSurvey('survey-a')).toBe(false);
        expect(storage.shouldShowSurvey('survey-b')).toBe(true);
    });

    test('counts one impression per page load', async () => {
        const firstPage = await loadPage();
        for (let render = 0; render < 5; render++) {
            firstPage.recordSurveyImpression('survey-a');
        }

        const secondPage = await loadPage();
        secondPage.recordSurveyImpression('survey-a');
        secondPage.recordSurveyImpression('survey-a');
        expect(secondPage.shouldShowSurvey('survey-a')).toBe(true);

        const thirdPage = await loadPage();
        thirdPage.recordSurveyImpression('survey-a');
        expect(thirdPage.shouldShowSurvey('survey-a')).toBe(false);
    });

    test('forgets the oldest interaction once 50 are remembered', async () => {
        const storage = await loadPage();
        interactWithMany(storage, 50);
        endGracePeriod();
        expect(storage.shouldShowSurvey('survey-1')).toBe(false);

        storage.recordSurveyInteraction('survey-51');
        endGracePeriod();

        expect(storage.shouldShowSurvey('survey-1')).toBe(true);
        expect(storage.shouldShowSurvey('survey-51')).toBe(false);
    });

    test('remembers a survey interacted with twice only once', async () => {
        const storage = await loadPage();
        interactWithMany(storage, 50);

        storage.recordSurveyInteraction('survey-50');
        endGracePeriod();

        expect(storage.shouldShowSurvey('survey-1')).toBe(false);
    });

    test('treats corrupted storage as empty', async () => {
        seedRaw(INTERACTIONS_RAW_KEY, { 'survey-a': true });
        seedRaw(IMPRESSIONS_RAW_KEY, { 'survey-a': '5' });

        const storage = await loadPage();

        expect(storage.shouldShowSurvey('survey-a')).toBe(true);
    });

    test('replaces corrupted storage when the user interacts with a survey', async () => {
        seedRaw(INTERACTIONS_RAW_KEY, { 'survey-a': true });
        const storage = await loadPage();

        storage.recordSurveyInteraction('survey-b');
        endGracePeriod();

        expect(storage.shouldShowSurvey('survey-b')).toBe(false);
    });
});
