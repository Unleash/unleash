import { headers } from 'utils/apiUtils';
import {
    SURVEY_VERSION,
    type SurveyAnswers,
    type SurveyTransport,
} from '../survey.ts';

export const submitSurveyResponse = async ({
    flagName,
    submitBase,
    environmentId,
    respondentId,
    answers,
}: SurveyTransport & {
    respondentId?: string;
    answers: SurveyAnswers;
}): Promise<void> => {
    await fetch(
        `${submitBase}/feedback/features/${encodeURIComponent(flagName)}/survey-responses`,
        {
            method: 'POST',
            credentials: 'omit',
            // The card fades out right after submit and the user may navigate
            // away; keepalive lets the request outlive the page.
            keepalive: true,
            headers,
            body: JSON.stringify({
                surveyVersion: SURVEY_VERSION,
                environmentId,
                respondentId,
                answers,
            }),
        },
    );
};
