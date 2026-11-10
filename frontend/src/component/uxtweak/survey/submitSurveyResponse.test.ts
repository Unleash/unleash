import { beforeEach, describe, expect, it } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { getVisitorId, submitSurveyResponse } from './submitSurveyResponse.ts';
import type { SurveyConfig } from './surveys.ts';

const server = testServerSetup();

const survey: SurveyConfig = {
    flagName: 'uxtweak-survey-projects-abc1',
    surveyId: 'sv_1',
    page: '/projects',
    title: 'Quick feedback',
    intro: 'One question.',
    questions: [
        { id: 'q1', type: 'rating', prompt: 'Rate this page', required: true },
    ],
    submitBase: 'https://uxtweak.example.com',
};

describe('submitSurveyResponse', () => {
    it('posts the response to the survey server', async () => {
        const { requests } = testServerRoute(
            server,
            'https://uxtweak.example.com/public/survey/responses',
            {},
            'post',
        );

        await submitSurveyResponse({
            survey,
            visitorId: 'visitor-1',
            answers: { q1: 4 },
        });

        expect(requests).toEqual([
            {
                surveyId: 'sv_1',
                visitorId: 'visitor-1',
                page: '/projects',
                answers: { q1: 4 },
            },
        ]);
    });
});

describe('getVisitorId', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('prefers the Unleash session id', () => {
        expect(getVisitorId('session-9')).toBe('session-9');
    });

    it('mints and persists an id when there is no session id', () => {
        const minted = getVisitorId(undefined);
        expect(minted).not.toBe('');
        expect(getVisitorId(undefined)).toBe(minted);
    });

    it('treats an empty session id as missing', () => {
        expect(getVisitorId('')).toBe(getVisitorId(undefined));
    });
});
