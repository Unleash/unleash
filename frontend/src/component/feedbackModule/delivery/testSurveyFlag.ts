import type { IToggle } from '@unleash/proxy-client-react';
import { SURVEY_KIND, SURVEY_VERSION } from '../survey.ts';
import type { SurveyTrigger } from '../triggers/surveyTrigger.ts';

export const SURVEY_SUBMIT_BASE = 'https://hosted.example.com/hosted';

export const flagWithPayload = (
    name: string,
    payloadValue: string,
): IToggle => ({
    name,
    enabled: true,
    impressionData: false,
    variant: {
        name: 'survey',
        enabled: true,
        feature_enabled: true,
        payload: { type: 'json', value: payloadValue },
    },
});

export const surveyFlag = (
    name: string,
    title?: string,
    trigger: SurveyTrigger = { on: 'page' },
): IToggle =>
    flagWithPayload(
        name,
        JSON.stringify({
            kind: SURVEY_KIND,
            version: SURVEY_VERSION,
            environmentId: 'production',
            title,
            questions: [
                { id: 'comment', type: 'free-text', prompt: 'Comment' },
            ],
            submitBase: SURVEY_SUBMIT_BASE,
            trigger,
        }),
    );
