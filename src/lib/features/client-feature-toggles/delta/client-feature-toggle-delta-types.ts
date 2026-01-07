import type { ClientFeatureSchema } from '../../../openapi/index.js';
import type { IClientSegment } from '../../../types/index.js';

export type DeltaHydrationEvent = {
    eventId: number;
    type: 'hydration';
    features: ClientFeatureSchema[];
    segments: IClientSegment[];
};

export type DeltaEvent =
    | {
          eventId: number;
          type: 'feature-updated';
          feature: ClientFeatureSchema;
      }
    | {
          eventId: number;
          type: 'feature-removed';
          featureName: string;
          project: string;
      }
    | {
          eventId: number;
          type: 'segment-updated';
          segment: IClientSegment;
      }
    | {
          eventId: number;
          type: 'segment-removed';
          segmentId: number;
      };

export const DELTA_EVENT_TYPES = {
    FEATURE_UPDATED: 'feature-updated',
    FEATURE_REMOVED: 'feature-removed',
    SEGMENT_UPDATED: 'segment-updated',
    SEGMENT_REMOVED: 'segment-removed',
    HYDRATION: 'hydration',
} as const;

export const isDeltaFeatureUpdatedEvent = (
    event: DeltaEvent,
): event is Extract<DeltaEvent, { type: 'feature-updated' }> => {
    return event.type === DELTA_EVENT_TYPES.FEATURE_UPDATED;
};

export const isDeltaFeatureRemovedEvent = (
    event: DeltaEvent,
): event is Extract<DeltaEvent, { type: 'feature-removed' }> => {
    return event.type === DELTA_EVENT_TYPES.FEATURE_REMOVED;
};

export const isDeltaSegmentEvent = (
    event: DeltaEvent,
): event is Extract<DeltaEvent, { type: 'segment-updated' }> => {
    return (
        event.type === DELTA_EVENT_TYPES.SEGMENT_UPDATED ||
        event.type === DELTA_EVENT_TYPES.SEGMENT_REMOVED
    );
};
