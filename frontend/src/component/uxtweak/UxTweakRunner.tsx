import { useEffect } from 'react';
import { useUnleashClient } from '@unleash/proxy-client-react';
import { useLatched } from './useLatched.ts';
import { useActiveSurvey } from './survey/useActiveSurvey.ts';
import { recordSurveyShown } from './survey/seenSurveys.ts';
import {
    getVisitorId,
    submitSurveyResponse,
} from './survey/submitSurveyResponse.ts';
import type { SurveyAnswers } from './survey/surveys.ts';
import { UxSurveyCard } from './survey/UxSurveyCard.tsx';

const UxTweakRunner = () => {
    const client = useUnleashClient();
    const activeSurvey = useActiveSurvey();
    // Latched: once shown, the card survives flag refreshes and route changes.
    const survey = useLatched(activeSurvey);
    const surveyId = survey?.surveyId;

    useEffect(() => {
        if (surveyId) {
            recordSurveyShown(surveyId);
        }
    }, [surveyId]);

    if (!survey) {
        return null;
    }

    const onSubmitted = (answers: SurveyAnswers) => {
        submitSurveyResponse({
            survey,
            visitorId: getVisitorId(client.getContext().sessionId),
            answers,
        }).catch(() => {});
    };

    return (
        <UxSurveyCard
            key={survey.surveyId}
            survey={survey}
            onSubmitted={onSubmitted}
        />
    );
};

export default UxTweakRunner;
