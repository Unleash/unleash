import type { DeltaEvent } from './client-feature-toggle-delta';
import {
    DELTA_EVENT_TYPES,
    type DeltaHydrationEvent,
} from './client-feature-toggle-delta-types';

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
            this.events.shift();
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
                    const segmentToUpdate = this.hydrationEvent.segments.find(
                        (segment) => segment.id === appliedEvent.segment.id,
                    );
                    if (segmentToUpdate) {
                        Object.assign(segmentToUpdate, appliedEvent.segment);
                    } else {
                        this.hydrationEvent.segments.push(appliedEvent.segment);
                    }
                    break;
                }
                case DELTA_EVENT_TYPES.SEGMENT_REMOVED: {
                    this.hydrationEvent.segments =
                        this.hydrationEvent.segments.filter(
                            (segment) => segment.id !== appliedEvent.segmentId,
                        );
                    break;
                }
            }
        }
    }
}
