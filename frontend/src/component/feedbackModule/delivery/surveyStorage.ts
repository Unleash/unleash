/**
 * What the browser remembers about surveys. Whether a survey may show is
 * decided in useSurveyScheduler.
 * - Interaction: the user submitted or dismissed the survey. Answering some
 *   questions and leaving does not count.
 * - Grace period: starts after any survey interaction, or once PNPS is due,
 *   and lasts 7 days.
 * - Impressions: how many page loads a survey appeared on.
 * - Occurrences: how many times the scheduler counted the trigger of a
 *   survey.
 */
import { createLocalStorage } from 'utils/createLocalStorage';

const INTERACTIONS_KEY = 'feedback-module-survey-interactions:v1';
const GRACE_KEY = 'feedback-module-survey-grace:v1';
const IMPRESSIONS_KEY = 'feedback-module-survey-impressions:v1';
const OCCURRENCES_KEY = 'feedback-module-survey-occurrences:v1';
const MAX_INTERACTIONS = 50;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type Counts = Record<string, number>;

const interactions = () => createLocalStorage<string[]>(INTERACTIONS_KEY, []);

const gracePeriod = () =>
    createLocalStorage<string>(GRACE_KEY, '', SEVEN_DAYS_MS);

const impressions = () => createLocalStorage<Counts>(IMPRESSIONS_KEY, {});

const occurrences = () => createLocalStorage<Counts>(OCCURRENCES_KEY, {});

const toFlagNames = (value: unknown): string[] =>
    Array.isArray(value)
        ? value.filter((name): name is string => typeof name === 'string')
        : [];

const toCounts = (value: unknown): Counts =>
    value && typeof value === 'object' && !Array.isArray(value)
        ? Object.fromEntries(
              Object.entries(value).filter(
                  (entry): entry is [string, number] =>
                      typeof entry[1] === 'number',
              ),
          )
        : {};

const increment = (value: unknown, flagName: string): Counts => {
    const counts = toCounts(value);
    return { ...counts, [flagName]: (counts[flagName] ?? 0) + 1 };
};

export const hasInteractedWithSurvey = (flagName: string): boolean =>
    toFlagNames(interactions().value).includes(flagName);

export const isInSurveyGracePeriod = (): boolean =>
    gracePeriod().value === 'active';

export const surveyImpressionCount = (flagName: string): number =>
    toCounts(impressions().value)[flagName] ?? 0;

export const startSurveyGracePeriod = (): void => {
    gracePeriod().setValue('active');
};

export const recordSurveyInteraction = (flagName: string): void => {
    interactions().setValue((current) =>
        [...toFlagNames(current).filter((name) => name !== flagName), flagName]
            // Only the newest names are kept so the list can't grow forever.
            .slice(-MAX_INTERACTIONS),
    );
    startSurveyGracePeriod();
};

// Re-renders and route changes must not count as new impressions.
const recordedThisPageLoad = new Set<string>();

export const recordSurveyImpression = (flagName: string): void => {
    if (recordedThisPageLoad.has(flagName)) {
        return;
    }
    recordedThisPageLoad.add(flagName);
    impressions().setValue((current) => increment(current, flagName));
};

export const surveyOccurrenceCount = (flagName: string): number =>
    toCounts(occurrences().value)[flagName] ?? 0;

export const recordSurveyOccurrence = (flagName: string): void => {
    occurrences().setValue((current) => increment(current, flagName));
};
