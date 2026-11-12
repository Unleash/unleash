import { useRef } from 'react';
import type { TriggerEvent } from '../triggers/triggerEvent.ts';

type SurveysCountedOnPage = { path: string; countedFlagNames: Set<string> };

interface PageVisitDeduplication {
    trackPageChange: (event: TriggerEvent) => void;
    isNewOccurrence: (event: TriggerEvent, flagName: string) => boolean;
}

const emptySurveysCountedOn = (path: string): SurveysCountedOnPage => ({
    path,
    countedFlagNames: new Set(),
});

/**
 * Counts each page view once per survey until the path changes. This
 * prevents a flag update from counting a single page multiple times.
 */
export const usePageVisitDeduplication = (): PageVisitDeduplication => {
    const counted = useRef(emptySurveysCountedOn(''));

    const trackPageChange = (event: TriggerEvent) => {
        if (event.on === 'page' && event.path !== counted.current.path) {
            counted.current = emptySurveysCountedOn(event.path);
        }
    };

    const isNewOccurrence = (event: TriggerEvent, flagName: string) => {
        if (event.on !== 'page') {
            return true;
        }
        const { countedFlagNames } = counted.current;
        if (countedFlagNames.has(flagName)) {
            return false;
        }
        countedFlagNames.add(flagName);
        return true;
    };

    return { trackPageChange, isNewOccurrence };
};
