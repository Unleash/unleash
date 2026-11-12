import { useEffect, useState } from 'react';
import type { Survey } from '../survey.ts';
import { matchTriggers } from '../triggers/matchTriggers.ts';
import type { TriggerEvent } from '../triggers/triggerEvent.ts';
import { usePageVisitDeduplication } from './usePageVisitDeduplication.ts';

type SchedulerState =
    | { status: 'idle' }
    | { status: 'waiting'; survey: Survey }
    | { status: 'shown'; survey: Survey };

export interface SurveyStore {
    hasInteractedWithSurvey: (flagName: string) => boolean;
    isInSurveyGracePeriod: () => boolean;
    surveyImpressionCount: (flagName: string) => number;
    surveyOccurrenceCount: (flagName: string) => number;
    recordSurveyOccurrence: (flagName: string) => void;
}

interface SurveyScheduler {
    shown: Survey | null;
    process: (event: TriggerEvent) => void;
    dismiss: () => void;
}

const idle: SchedulerState = { status: 'idle' };

const MAX_IMPRESSIONS = 3;

type ScheduledSurvey = Pick<Survey, 'flagName' | 'trigger'>;

const hasReachedOccurrence = (
    store: SurveyStore,
    { flagName, trigger }: ScheduledSurvey,
): boolean =>
    trigger.onOccurrence === undefined ||
    store.surveyOccurrenceCount(flagName) >= trigger.onOccurrence;

/**
 * Rules that keep surveys from annoying users:
 * - A survey the user submitted or dismissed never shows again.
 * - No survey shows during the grace period.
 * - An ignored survey stops showing after MAX_IMPRESSIONS.
 * - A survey with onOccurrence waits until its trigger fired that many
 *   times. Occurrences are counted until that many are reached or the user
 *   submits or dismisses the survey, also during the grace period and
 *   while a survey is shown.
 */
export const shouldShowSurvey = (
    store: SurveyStore,
    survey: ScheduledSurvey,
): boolean =>
    !store.hasInteractedWithSurvey(survey.flagName) &&
    !store.isInSurveyGracePeriod() &&
    store.surveyImpressionCount(survey.flagName) < MAX_IMPRESSIONS &&
    hasReachedOccurrence(store, survey);

const shouldCountOccurrence = (
    store: SurveyStore,
    { flagName, trigger }: ScheduledSurvey,
): boolean =>
    trigger.onOccurrence !== undefined &&
    !store.hasInteractedWithSurvey(flagName) &&
    store.surveyOccurrenceCount(flagName) < trigger.onOccurrence;

const waitForIfIdle =
    (survey: Survey) =>
    (current: SchedulerState): SchedulerState =>
        current.status === 'idle' ? { status: 'waiting', survey } : current;

export const useSurveyScheduler = (
    surveys: Survey[],
    store: SurveyStore,
): SurveyScheduler => {
    const [state, setState] = useState<SchedulerState>(idle);
    const pageVisits = usePageVisitDeduplication();

    useEffect(() => {
        if (state.status !== 'waiting') {
            return;
        }
        const { survey } = state;
        const timer = setTimeout(
            () => setState({ status: 'shown', survey }),
            survey.trigger.delayMs ?? 0,
        );
        return () => clearTimeout(timer);
    }, [state]);

    const recordOccurrence = (survey: Survey, event: TriggerEvent) => {
        if (
            shouldCountOccurrence(store, survey) &&
            pageVisits.isNewOccurrence(event, survey.flagName)
        ) {
            store.recordSurveyOccurrence(survey.flagName);
        }
    };

    const process = (event: TriggerEvent) => {
        pageVisits.trackPageChange(event);
        const matching = matchTriggers(event, surveys);
        for (const survey of matching) {
            recordOccurrence(survey, event);
        }
        const survey = matching.find((survey) =>
            shouldShowSurvey(store, survey),
        );
        if (survey !== undefined) {
            setState(waitForIfIdle(survey));
        }
    };

    const dismiss = () => setState(idle);

    return {
        shown: state.status === 'shown' ? state.survey : null,
        process,
        dismiss,
    };
};
