import { createLocalStorage } from 'utils/createLocalStorage';

const STORAGE_KEY = 'uxtweak-surveys-seen:v1';
const MAX_SEEN = 50;

const seenSurveys = () => createLocalStorage<string[]>(STORAGE_KEY, []);

const sanitize = (value: unknown): string[] =>
    Array.isArray(value)
        ? value.filter((id): id is string => typeof id === 'string')
        : [];

export const hasSeenSurvey = (surveyId: string): boolean =>
    sanitize(seenSurveys().value).includes(surveyId);

export const markSurveySeen = (surveyId: string): void => {
    seenSurveys().setValue((seen) =>
        [...sanitize(seen).filter((id) => id !== surveyId), surveyId].slice(
            -MAX_SEEN,
        ),
    );
};
