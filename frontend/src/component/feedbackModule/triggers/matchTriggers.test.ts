import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Survey } from '../survey.ts';
import type { SurveyTrigger } from './surveyTrigger.ts';
import { matchTriggers, type TriggerEvent } from './matchTriggers.ts';

const survey = (flagName: string, trigger: SurveyTrigger): Survey => ({
    flagName,
    environmentId: 'production',
    submitBase: 'https://hosted.example.com/hosted',
    title: null,
    description: null,
    questions: [
        {
            id: 'comment',
            type: 'free-text',
            prompt: 'Comment',
            required: false,
        },
    ],
    trigger,
});

const flagNames = (event: TriggerEvent, surveys: Survey[]): string[] =>
    matchTriggers(event, surveys).map(({ flagName }) => flagName);

const pageViewFlagNames = (path: string, surveys: Survey[]): string[] =>
    flagNames({ on: 'page', path }, surveys);

const clickedFlagNames = (
    path: string,
    target: Element,
    surveys: Survey[],
): string[] => flagNames({ on: 'click', path, target }, surveys);

const appearedFlagNames = (
    path: string,
    added: Element,
    surveys: Survey[],
): string[] => flagNames({ on: 'appear', path, added }, surveys);

const toast = (text: string): Element => {
    const element = document.createElement('div');
    element.dataset.testid = 'toast';
    element.textContent = text;
    return element;
};

const button = (testId?: string): Element => {
    const element = document.createElement('button');
    if (testId !== undefined) {
        element.dataset.testid = testId;
    }
    document.body.append(element);
    return element;
};

describe('matchTriggers', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        document.body.innerHTML = '';
    });

    it('matches a page trigger without a path on any page', () => {
        const surveys = [survey('survey-a', { on: 'page' })];

        expect(pageViewFlagNames('/', surveys)).toEqual(['survey-a']);
        expect(pageViewFlagNames('/projects/default', surveys)).toEqual([
            'survey-a',
        ]);
    });

    it('matches a page trigger whose path pattern matches the page', () => {
        const surveys = [
            survey('survey-a', { on: 'page', path: '/projects/:projectId' }),
        ];

        expect(pageViewFlagNames('/projects/default', surveys)).toEqual([
            'survey-a',
        ]);
    });

    it('does not match a page trigger whose path pattern misses the page', () => {
        const surveys = [
            survey('survey-a', { on: 'page', path: '/projects/:projectId' }),
        ];

        expect(
            pageViewFlagNames('/projects/default/features/x', surveys),
        ).toEqual([]);
        expect(pageViewFlagNames('/features', surveys)).toEqual([]);
    });

    it('matches a wildcard pattern on nested pages', () => {
        const surveys = [
            survey('survey-a', { on: 'page', path: '/projects/*' }),
        ];

        expect(
            pageViewFlagNames('/projects/default/features/x', surveys),
        ).toEqual(['survey-a']);
    });

    it('matches only path-less triggers when the browser cannot check page patterns', () => {
        vi.stubGlobal('URLPattern', undefined);
        const surveys = [
            survey('survey-a', { on: 'page', path: '/projects' }),
            survey('survey-b', { on: 'page' }),
        ];

        expect(pageViewFlagNames('/projects', surveys)).toEqual(['survey-b']);
    });

    it('keeps the order of the surveys', () => {
        const surveys = [
            survey('survey-b', { on: 'page' }),
            survey('survey-c', { on: 'page', path: '/features' }),
            survey('survey-a', { on: 'page' }),
        ];

        expect(pageViewFlagNames('/projects', surveys)).toEqual([
            'survey-b',
            'survey-a',
        ]);
    });

    it('does not match a click trigger on a page view', () => {
        const surveys = [
            survey('survey-a', { on: 'click', selector: 'button' }),
        ];

        expect(pageViewFlagNames('/projects', surveys)).toEqual([]);
    });

    it('matches a click trigger when the clicked element matches', () => {
        const surveys = [
            survey('survey-a', {
                on: 'click',
                selector: '[data-testid="create-flag"]',
            }),
        ];

        expect(
            clickedFlagNames('/projects', button('create-flag'), surveys),
        ).toEqual(['survey-a']);
    });

    it('does not match a click trigger when the clicked element does not match', () => {
        const surveys = [
            survey('survey-a', { on: 'click', selector: 'button' }),
        ];
        const paragraph = document.createElement('p');
        document.body.append(paragraph);

        expect(clickedFlagNames('/projects', paragraph, surveys)).toEqual([]);
    });

    it('does not match a page trigger on a click', () => {
        const surveys = [survey('survey-a', { on: 'page' })];

        expect(clickedFlagNames('/projects', button(), surveys)).toEqual([]);
    });

    it('does not match appear or event triggers on page views or clicks', () => {
        const surveys = [
            survey('survey-a', { on: 'appear', selector: 'button' }),
            survey('survey-b', { on: 'event', name: 'flag-created' }),
        ];

        expect(pageViewFlagNames('/projects', surveys)).toEqual([]);
        expect(clickedFlagNames('/projects', button(), surveys)).toEqual([]);
    });

    it('matches an appear trigger when the added element matches', () => {
        const surveys = [
            survey('survey-a', {
                on: 'appear',
                selector: '[data-testid="toast"]',
                text: 'Flag created',
            }),
        ];

        expect(
            appearedFlagNames('/projects', toast('Flag created'), surveys),
        ).toEqual(['survey-a']);
    });

    it('does not match an appear trigger when the added element does not match', () => {
        const surveys = [
            survey('survey-a', { on: 'appear', text: 'Flag created' }),
        ];

        expect(
            appearedFlagNames('/projects', toast('Flag archived'), surveys),
        ).toEqual([]);
    });

    it('does not match page, click or event triggers on an appearance', () => {
        const surveys = [
            survey('survey-a', { on: 'page' }),
            survey('survey-b', {
                on: 'click',
                selector: '[data-testid="toast"]',
            }),
            survey('survey-c', { on: 'event', name: 'flag-created' }),
        ];

        expect(
            appearedFlagNames('/projects', toast('Flag created'), surveys),
        ).toEqual([]);
    });

    it('matches an appear trigger only on a page its path pattern matches', () => {
        const surveys = [
            survey('survey-a', {
                on: 'appear',
                text: 'Flag created',
                path: '/projects/*',
            }),
        ];

        expect(
            appearedFlagNames(
                '/projects/default/features/x',
                toast('Flag created'),
                surveys,
            ),
        ).toEqual(['survey-a']);
        expect(
            appearedFlagNames('/features', toast('Flag created'), surveys),
        ).toEqual([]);
    });

    it('matches a click trigger only on a page its path pattern matches', () => {
        const surveys = [
            survey('survey-a', {
                on: 'click',
                selector: 'button',
                path: '/projects/:projectId',
            }),
        ];

        expect(
            clickedFlagNames('/projects/default', button(), surveys),
        ).toEqual(['survey-a']);
        expect(clickedFlagNames('/features', button(), surveys)).toEqual([]);
    });
});
