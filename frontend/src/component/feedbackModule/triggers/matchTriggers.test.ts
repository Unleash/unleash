import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Survey } from '../survey.ts';
import type { SurveyTrigger } from './surveyTrigger.ts';
import { matchTriggers } from './matchTriggers.ts';

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

const matchedFlagNames = (path: string, surveys: Survey[]): string[] =>
    matchTriggers(path, surveys).map(({ flagName }) => flagName);

describe('matchTriggers', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('matches a page trigger without a path on any page', () => {
        const surveys = [survey('survey-a', { on: 'page' })];

        expect(matchedFlagNames('/', surveys)).toEqual(['survey-a']);
        expect(matchedFlagNames('/projects/default', surveys)).toEqual([
            'survey-a',
        ]);
    });

    it('matches a page trigger whose path pattern matches the page', () => {
        const surveys = [
            survey('survey-a', { on: 'page', path: '/projects/:projectId' }),
        ];

        expect(matchedFlagNames('/projects/default', surveys)).toEqual([
            'survey-a',
        ]);
    });

    it('does not match a page trigger whose path pattern misses the page', () => {
        const surveys = [
            survey('survey-a', { on: 'page', path: '/projects/:projectId' }),
        ];

        expect(
            matchedFlagNames('/projects/default/features/x', surveys),
        ).toEqual([]);
        expect(matchedFlagNames('/features', surveys)).toEqual([]);
    });

    it('matches a wildcard pattern on nested pages', () => {
        const surveys = [
            survey('survey-a', { on: 'page', path: '/projects/*' }),
        ];

        expect(
            matchedFlagNames('/projects/default/features/x', surveys),
        ).toEqual(['survey-a']);
    });

    it('matches only path-less triggers when the browser cannot check page patterns', () => {
        vi.stubGlobal('URLPattern', undefined);
        const surveys = [
            survey('survey-a', { on: 'page', path: '/projects' }),
            survey('survey-b', { on: 'page' }),
        ];

        expect(matchedFlagNames('/projects', surveys)).toEqual(['survey-b']);
    });

    it('keeps the order of the surveys', () => {
        const surveys = [
            survey('survey-b', { on: 'page' }),
            survey('survey-c', { on: 'page', path: '/features' }),
            survey('survey-a', { on: 'page' }),
        ];

        expect(matchedFlagNames('/projects', surveys)).toEqual([
            'survey-b',
            'survey-a',
        ]);
    });
});
