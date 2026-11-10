import { useMemo } from 'react';
import { type IToggle, useFlags } from '@unleash/proxy-client-react';
import { parseSurveyPayload, type Survey } from '../survey.ts';

export const parseSurveys = (flags: IToggle[]): Survey[] =>
    flags
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .map((flag) => parseSurveyPayload(flag.name, flag.variant?.payload))
        .filter((survey) => survey !== null);

export const useSurveys = (): Survey[] => {
    const flags = useFlags();
    return useMemo(() => parseSurveys(flags), [flags]);
};
