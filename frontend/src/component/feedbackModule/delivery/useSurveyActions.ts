import { useUnleashClient } from '@unleash/proxy-client-react';
import type { Survey, SurveyAnswers } from '../survey.ts';
import type { IdentifyUser } from './identifyUser.ts';
import { recordSurveyInteraction } from './surveyStorage.ts';
import { submitSurveyResponse } from './submitSurveyResponse.ts';

interface SurveyActionsOptions {
    shownSurvey: Survey | null;
    identifyUser: IdentifyUser;
    closeSurvey: () => void;
}

interface SurveyActions {
    submit: (answers: SurveyAnswers) => void;
    dismiss: () => void;
}

export const useSurveyActions = ({
    shownSurvey,
    identifyUser,
    closeSurvey,
}: SurveyActionsOptions): SurveyActions => {
    const client = useUnleashClient();

    const submit = (answers: SurveyAnswers) => {
        if (!shownSurvey) {
            return;
        }
        recordSurveyInteraction(shownSurvey.flagName);
        submitSurveyResponse({
            flagName: shownSurvey.flagName,
            submitBase: shownSurvey.submitBase,
            environmentId: shownSurvey.environmentId,
            respondentId: identifyUser(client.getContext()),
            answers,
        }).catch(() => {});
    };

    const dismiss = () => {
        if (shownSurvey) {
            recordSurveyInteraction(shownSurvey.flagName);
        }
        closeSurvey();
    };

    return { submit, dismiss };
};
