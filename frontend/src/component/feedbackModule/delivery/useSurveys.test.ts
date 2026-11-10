import { describe, expect, it } from 'vitest';
import type { IToggle } from '@unleash/proxy-client-react';
import { flagWithPayload, surveyFlag } from './testSurveyFlag.ts';
import { parseSurveys } from './useSurveys.ts';

const flagNames = (flags: IToggle[]) =>
    parseSurveys(flags).map((survey) => survey.flagName);

describe('parseSurveys', () => {
    it('orders surveys by flag name', () => {
        expect(
            flagNames([
                surveyFlag('survey-c'),
                surveyFlag('survey-a'),
                surveyFlag('survey-b'),
            ]),
        ).toEqual(['survey-a', 'survey-b', 'survey-c']);
    });

    it('leaves out flags whose payload is not a survey', () => {
        expect(
            flagNames([
                surveyFlag('survey-a'),
                flagWithPayload('survey-b', 'not json'),
            ]),
        ).toEqual(['survey-a']);
    });
});
