import type { DeltaEvent } from './client-feature-toggle-delta';
import {
    DELTA_EVENT_TYPES,
    type DeltaHydrationEvent,
} from './client-feature-toggle-delta-types';

const mergeWithoutDuplicates = (arr1: any[], arr2: any[]) => {
    const map = new Map();
    arr1.concat(arr2).forEach((item) => {
        map.set(item.name, item);
    });
    return Array.from(map.values());
};

export class DeltaCache {
    private events: DeltaEvent[] = [];
    private maxLength: number;
    private hydrationEvent: DeltaHydrationEvent;

    constructor(hydrationEvent: DeltaHydrationEvent, maxLength: number = 20) {
        this.hydrationEvent = hydrationEvent;
        this.maxLength = maxLength;
    }

    public addEvents(events: DeltaEvent[]): void {
        this.events = [...this.events, ...events];

        this.updateHydrationEvent(events);
        while (this.events.length > this.maxLength) {
            this.events.splice(1, 1);
        }
    }

    public getEvents(): DeltaEvent[] {
        return this.events;
    }

    public getHydrationEvent(): DeltaHydrationEvent {
        return this.hydrationEvent;
    }

    private updateHydrationEvent(events: DeltaEvent[]): void {
        for (const appliedEvent of events) {
            switch (appliedEvent.type) {
                case DELTA_EVENT_TYPES.FEATURE_UPDATED: {
                    const featureToUpdate = this.hydrationEvent.features.find(
                        (feature) => feature.name === appliedEvent.feature.name,
                    );
                    if (featureToUpdate) {
                        Object.assign(featureToUpdate, appliedEvent.feature);
                    } else {
                        this.hydrationEvent.features.push(appliedEvent.feature);
                    }
                    break;
                }
                case DELTA_EVENT_TYPES.FEATURE_REMOVED: {
                    this.hydrationEvent.features =
                        this.hydrationEvent.features.filter(
                            (feature) =>
                                feature.name !== appliedEvent.featureName,
                        );
                    break;
                }
                case DELTA_EVENT_TYPES.SEGMENT_UPDATED: {
                    // TODO: segments do not exist in this scope, need to do it in different location
                    break;
                }
                case DELTA_EVENT_TYPES.SEGMENT_REMOVED: {
                    // TODO: segments do not exist in this scope, need to do it in different location
                    break;
                }
                default:
                // TODO: something is seriously wrong
            }
        }
    }
}
