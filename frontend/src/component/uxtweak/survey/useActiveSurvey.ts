import { useLocation } from 'react-router';
import { useFlags } from '@unleash/proxy-client-react';
import { scanSurveys, type SurveyConfig } from './surveys.ts';

const firstOrNull = (surveys: SurveyConfig[]): SurveyConfig | null =>
    surveys.at(0) ?? null;

export const useActiveSurvey = (): SurveyConfig | null => {
    const flags = useFlags();
    const { pathname } = useLocation();
    return firstOrNull(scanSurveys(flags, pathname));
};
