import { createLocalStorage } from 'utils/createLocalStorage';
import type { SurveyAnswers, SurveyConfig } from './surveys.ts';

const VISITOR_KEY = 'uxtweak-visitor-id:v1';

const storedVisitorId = () => createLocalStorage<string>(VISITOR_KEY, '');

export const getVisitorId = (
    sessionId: string | number | undefined,
): string => {
    if (sessionId) {
        return String(sessionId);
    }
    const { value, setValue } = storedVisitorId();
    return value || setValue(crypto.randomUUID());
};

export const submitSurveyResponse = async (options: {
    survey: SurveyConfig;
    visitorId: string;
    answers: SurveyAnswers;
}): Promise<void> => {
    await fetch(`${options.survey.submitBase}/public/survey/responses`, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            surveyId: options.survey.surveyId,
            visitorId: options.visitorId,
            page: options.survey.page,
            answers: options.answers,
        }),
    });
};
