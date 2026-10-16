import { formatApiPath } from 'utils/formatPath';
import { headers } from 'utils/apiUtils';
import { SURVEY_VERSION, type SurveyAnswers } from '../survey.ts';

export const submitSurveyResponse = async ({
    flagName,
    respondentId,
    answers,
}: {
    flagName: string;
    respondentId?: string;
    answers: SurveyAnswers;
}): Promise<void> => {
    await fetch(
        formatApiPath(
            `feedback/features/${encodeURIComponent(flagName)}/survey-responses`,
        ),
        {
            method: 'POST',
            // The card fades out right after submit and the user may navigate
            // away; keepalive lets the request outlive the page.
            keepalive: true,
            headers,
            body: JSON.stringify({
                surveyVersion: SURVEY_VERSION,
                respondentId,
                answers,
            }),
        },
    );
};
