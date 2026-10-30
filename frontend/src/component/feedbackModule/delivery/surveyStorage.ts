/**
 * Rules that keep surveys from annoying users:
 * - Interaction: the user submitted or dismissed the survey. It never shows
 *   again. Answering some questions and leaving does not count.
 * - Grace period: after any survey interaction, or once PNPS is due, no
 *   survey shows for 7 days.
 * - Impressions: how many page loads a survey appeared on. An ignored survey
 *   stops showing after MAX_IMPRESSIONS.
 */
import { createLocalStorage } from 'utils/createLocalStorage';

const INTERACTIONS_KEY = 'feedback-module-survey-interactions:v1';
const GRACE_KEY = 'feedback-module-survey-grace:v1';
const IMPRESSIONS_KEY = 'feedback-module-survey-impressions:v1';
const MAX_INTERACTIONS = 50;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const MAX_IMPRESSIONS = 3;

type Impressions = Record<string, number>;

const interactions = () => createLocalStorage<string[]>(INTERACTIONS_KEY, []);

const gracePeriod = () =>
    createLocalStorage<string>(GRACE_KEY, '', SEVEN_DAYS_MS);

const impressions = () => createLocalStorage<Impressions>(IMPRESSIONS_KEY, {});

const toFlagNames = (value: unknown): string[] =>
    Array.isArray(value)
        ? value.filter((name): name is string => typeof name === 'string')
        : [];

const toImpressions = (value: unknown): Impressions =>
    value && typeof value === 'object' && !Array.isArray(value)
        ? Object.fromEntries(
              Object.entries(value).filter(
                  (entry): entry is [string, number] =>
                      typeof entry[1] === 'number',
              ),
          )
        : {};

const hasInteractedWithSurvey = (flagName: string): boolean =>
    toFlagNames(interactions().value).includes(flagName);

const isInSurveyGracePeriod = (): boolean => gracePeriod().value === 'active';

const hasReachedImpressionCap = (flagName: string): boolean =>
    (toImpressions(impressions().value)[flagName] ?? 0) >= MAX_IMPRESSIONS;

export const shouldShowSurvey = (flagName: string): boolean =>
    !hasInteractedWithSurvey(flagName) &&
    !isInSurveyGracePeriod() &&
    !hasReachedImpressionCap(flagName);

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
    impressions().setValue((current) => {
        const counts = toImpressions(current);
        return { ...counts, [flagName]: (counts[flagName] ?? 0) + 1 };
    });
};
