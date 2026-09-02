import { createLocalStorage } from 'utils/createLocalStorage';

const STORAGE_KEY = 'uxtweak-surveys-seen:v1';
const GRACE_KEY = 'uxtweak-survey-grace:v1';
const IMPRESSIONS_KEY = 'uxtweak-survey-impressions:v1';
const MAX_SEEN = 50;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAY_GRACE_PERIOD_MS = 7 * ONE_DAY_MS;

export const MAX_IMPRESSIONS = 3;

const seenSurveys = () => createLocalStorage<string[]>(STORAGE_KEY, []);

// The grace marker expires on its own: createLocalStorage's timeToLive
// removes it on the first read after the grace period.
const gracePeriod = () =>
    createLocalStorage<string>(GRACE_KEY, '', SEVEN_DAY_GRACE_PERIOD_MS);

const shownSurveys = () => createLocalStorage<string[]>(IMPRESSIONS_KEY, []);

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
    gracePeriod().setValue('active');
};

export const isInSurveyGracePeriod = (): boolean =>
    gracePeriod().value === 'active';

export const hasReachedImpressionCap = (surveyId: string): boolean =>
    sanitize(shownSurveys().value).filter((id) => id === surveyId).length >=
    MAX_IMPRESSIONS;

const surveyIdsRecordedThisPageLoad = new Set<string>();

export const recordSurveyShown = (surveyId: string): void => {
    if (surveyIdsRecordedThisPageLoad.has(surveyId)) {
        return;
    }
    surveyIdsRecordedThisPageLoad.add(surveyId);
    shownSurveys().setValue((shown) => [...sanitize(shown), surveyId]);
};
