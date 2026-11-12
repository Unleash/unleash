import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { Survey } from '../survey.ts';
import type { SurveyTrigger } from '../triggers/surveyTrigger.ts';
import {
    type SurveyStore,
    shouldShowSurvey,
    useSurveyScheduler,
} from './useSurveyScheduler.ts';

const storeWith = (overrides: Partial<SurveyStore> = {}): SurveyStore => ({
    hasInteractedWithSurvey: () => false,
    isInSurveyGracePeriod: () => false,
    surveyImpressionCount: () => 0,
    surveyOccurrenceCount: () => 0,
    recordSurveyOccurrence: () => {},
    ...overrides,
});

const countingStore = (overrides: Partial<SurveyStore> = {}) => {
    const occurrences = new Map<string, number>();
    const store = storeWith({
        ...overrides,
        surveyOccurrenceCount: (flagName) => occurrences.get(flagName) ?? 0,
        recordSurveyOccurrence: (flagName) =>
            occurrences.set(flagName, (occurrences.get(flagName) ?? 0) + 1),
    });
    return { store, occurrences };
};

const survey = (
    flagName: string,
    trigger: SurveyTrigger = { on: 'page' },
): Survey => ({
    flagName,
    trigger,
    title: null,
    description: null,
    questions: [],
    environmentId: 'development',
    submitBase: 'https://surveys.example.com',
});

const ON_SECOND_PAGE_VIEW: SurveyTrigger = { on: 'page', onOccurrence: 2 };
const ON_THIRD_PAGE_VIEW: SurveyTrigger = { on: 'page', onOccurrence: 3 };

const FLAG_CREATED = { on: 'event', path: '/', name: 'flag-created' } as const;

const ON_SECOND_FLAG_CREATED: SurveyTrigger = {
    on: 'event',
    name: 'flag-created',
    onOccurrence: 2,
};

const scheduleSurveys = (surveys: Survey[], store: SurveyStore) =>
    renderHook(() => useSurveyScheduler(surveys, store)).result;

describe('shouldShowSurvey', () => {
    test('shows a survey the user has not seen', () => {
        expect(shouldShowSurvey(storeWith(), survey('survey-a'))).toBe(true);
    });

    test('never shows a survey again once the user interacted with it', () => {
        const store = storeWith({
            hasInteractedWithSurvey: (flagName) => flagName === 'survey-a',
        });

        expect(shouldShowSurvey(store, survey('survey-a'))).toBe(false);
        expect(shouldShowSurvey(store, survey('survey-b'))).toBe(true);
    });

    test('shows no survey during the grace period', () => {
        const store = storeWith({ isInSurveyGracePeriod: () => true });

        expect(shouldShowSurvey(store, survey('survey-a'))).toBe(false);
    });

    test('stops showing a survey after 3 impressions', () => {
        const impressions: Record<string, number> = {
            'survey-a': 3,
            'survey-b': 2,
        };
        const store = storeWith({
            surveyImpressionCount: (flagName) => impressions[flagName] ?? 0,
        });

        expect(shouldShowSurvey(store, survey('survey-a'))).toBe(false);
        expect(shouldShowSurvey(store, survey('survey-b'))).toBe(true);
    });

    test('shows a survey only once its trigger occurred as often as defined', () => {
        const occurrences: Record<string, number> = {
            'survey-a': 1,
            'survey-b': 2,
        };
        const store = storeWith({
            surveyOccurrenceCount: (flagName) => occurrences[flagName] ?? 0,
        });

        expect(
            shouldShowSurvey(store, survey('survey-a', ON_SECOND_PAGE_VIEW)),
        ).toBe(false);
        expect(
            shouldShowSurvey(store, survey('survey-b', ON_SECOND_PAGE_VIEW)),
        ).toBe(true);
    });
});

describe('useSurveyScheduler', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    test('stops counting occurrences once the defined one is reached', () => {
        const { store, occurrences } = countingStore();
        const scheduler = scheduleSurveys(
            [survey('survey-a', ON_SECOND_FLAG_CREATED)],
            store,
        );

        for (let occurrence = 0; occurrence < 3; occurrence++) {
            act(() => scheduler.current.process(FLAG_CREATED));
        }

        expect(Object.fromEntries(occurrences)).toEqual({ 'survey-a': 2 });
    });

    test('counts no occurrences for a survey without onOccurrence', () => {
        const { store, occurrences } = countingStore();
        const scheduler = scheduleSurveys(
            [
                survey('survey-a', {
                    on: 'event',
                    name: 'flag-created',
                }),
            ],
            store,
        );

        act(() => scheduler.current.process(FLAG_CREATED));

        expect(occurrences.size).toBe(0);
    });

    test('stops counting occurrences once the user interacted with the survey', () => {
        const { store, occurrences } = countingStore({
            hasInteractedWithSurvey: (flagName) => flagName === 'survey-a',
        });
        const scheduler = scheduleSurveys(
            [
                survey('survey-a', ON_SECOND_FLAG_CREATED),
                survey('survey-b', ON_SECOND_FLAG_CREATED),
            ],
            store,
        );

        act(() => scheduler.current.process(FLAG_CREATED));

        expect(Object.fromEntries(occurrences)).toEqual({ 'survey-b': 1 });
    });

    test('counts the occurrence for every matching survey', () => {
        const { store, occurrences } = countingStore();
        const scheduler = scheduleSurveys(
            [
                survey('survey-a', { on: 'event', name: 'flag-created' }),
                survey('survey-b', ON_SECOND_FLAG_CREATED),
                survey('survey-c', ON_SECOND_FLAG_CREATED),
            ],
            store,
        );

        act(() => scheduler.current.process(FLAG_CREATED));

        expect(Object.fromEntries(occurrences)).toEqual({
            'survey-b': 1,
            'survey-c': 1,
        });
    });

    test('counts occurrences during the grace period', () => {
        const { store, occurrences } = countingStore({
            isInSurveyGracePeriod: () => true,
        });
        const scheduler = scheduleSurveys(
            [survey('survey-a', ON_SECOND_FLAG_CREATED)],
            store,
        );

        act(() => scheduler.current.process(FLAG_CREATED));

        expect(Object.fromEntries(occurrences)).toEqual({ 'survey-a': 1 });
    });

    test('counts a page once however often it is observed', () => {
        const { store, occurrences } = countingStore();
        const scheduler = scheduleSurveys(
            [survey('survey-a', ON_THIRD_PAGE_VIEW)],
            store,
        );

        act(() => scheduler.current.process({ on: 'page', path: '/' }));
        act(() => scheduler.current.process({ on: 'page', path: '/' }));

        expect(Object.fromEntries(occurrences)).toEqual({ 'survey-a': 1 });
    });

    test('counts each return to a page', () => {
        const { store, occurrences } = countingStore();
        const scheduler = scheduleSurveys(
            [survey('survey-a', { ...ON_THIRD_PAGE_VIEW, path: '/features' })],
            store,
        );

        act(() => scheduler.current.process({ on: 'page', path: '/features' }));
        act(() => scheduler.current.process({ on: 'page', path: '/projects' }));
        act(() => scheduler.current.process({ on: 'page', path: '/features' }));

        expect(Object.fromEntries(occurrences)).toEqual({ 'survey-a': 2 });
    });

    test('counts the page the user is on for a survey that arrives later', () => {
        const { store, occurrences } = countingStore();
        const { result, rerender } = renderHook(
            (surveys: Survey[]) => useSurveyScheduler(surveys, store),
            { initialProps: [survey('survey-a', ON_THIRD_PAGE_VIEW)] },
        );
        act(() => result.current.process({ on: 'page', path: '/' }));

        rerender([
            survey('survey-a', ON_THIRD_PAGE_VIEW),
            survey('survey-b', ON_THIRD_PAGE_VIEW),
        ]);
        act(() => result.current.process({ on: 'page', path: '/' }));

        expect(Object.fromEntries(occurrences)).toEqual({
            'survey-a': 1,
            'survey-b': 1,
        });
    });

    test('counts occurrences while a survey is shown', () => {
        vi.useFakeTimers();
        const { store, occurrences } = countingStore();
        const scheduler = scheduleSurveys(
            [
                survey('survey-a', { on: 'page', path: '/' }),
                survey('survey-b', {
                    on: 'page',
                    path: '/projects',
                    onOccurrence: 2,
                }),
            ],
            store,
        );
        act(() => scheduler.current.process({ on: 'page', path: '/' }));
        act(() => vi.runAllTimers());
        expect(scheduler.current.shown?.flagName).toBe('survey-a');

        act(() => scheduler.current.process({ on: 'page', path: '/projects' }));

        expect(Object.fromEntries(occurrences)).toEqual({ 'survey-b': 1 });
    });
});
