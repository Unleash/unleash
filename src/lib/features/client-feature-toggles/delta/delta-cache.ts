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

        this.addBaseEventFromHydration(hydrationEvent);
    }

    private addBaseEventFromHydration(
        hydrationEvent: DeltaHydrationEvent,
    ): void {
        const lastFeature =
            hydrationEvent.features[hydrationEvent.features.length - 1];
        this.addEvents([
            {
                eventId: hydrationEvent.eventId,
                type: 'feature-updated',
                feature: lastFeature,
            },
        ]);
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

    public isMissingRevision(revisionId: number): boolean {
        return !this.events.some((event) => event.eventId === revisionId);
    }

    public getHydrationEvent(): DeltaHydrationEvent {
        return this.hydrationEvent;
    }

    private updateHydrationEvent(events: DeltaEvent[]): void {
        for (const appliedEvent of events) {
            switch (appliedEvent.type) {
                case DELTA_EVENT_TYPES.FEATURE_UPDATED: {
                    const featureIndex = this.hydrationEvent.features.findIndex(
                        (feature) => feature.name === appliedEvent.feature.name,
                    );

                    if (featureIndex > -1) {
                        this.hydrationEvent.features[featureIndex] =
                            appliedEvent.feature;
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
                    const segmentIndex = this.hydrationEvent.segments.findIndex(
                        (segment) => segment.id === appliedEvent.segment.id,
                    );
                    if (segmentIndex > -1) {
                        this.hydrationEvent.segments[segmentIndex] =
                            appliedEvent.segment;
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
            this.hydrationEvent.eventId = appliedEvent.eventId;
        }
    }
}
