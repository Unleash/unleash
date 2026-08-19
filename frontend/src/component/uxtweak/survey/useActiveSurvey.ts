import { useLocation } from 'react-router';
import { useFlags } from '@unleash/proxy-client-react';
import { hasSeenSurvey } from './seenSurveys.ts';
import { scanSurveys, type SurveyConfig } from './surveys.ts';

export const useActiveSurvey = (): SurveyConfig | null => {
    const flags = useFlags();
    const { pathname } = useLocation();
    return (
        scanSurveys(flags, pathname).find(
            (survey) => !hasSeenSurvey(survey.surveyId),
        ) ?? null
    );
};
