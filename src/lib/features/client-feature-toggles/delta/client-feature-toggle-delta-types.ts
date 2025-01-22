import type { ClientFeatureSchema } from '../../../openapi';
import type { IClientSegment } from '../../../types';

export type DeltaHydrationEvent = {
    eventId: number;
    type: 'hydration';
    features: ClientFeatureSchema[];
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
      }
    | DeltaHydrationEvent;

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

export const isDeltaSegmentUpdatedEvent = (
    event: DeltaEvent,
): event is Extract<DeltaEvent, { type: 'segment-updated' }> => {
    return event.type === DELTA_EVENT_TYPES.SEGMENT_UPDATED;
};

export const isDeltaSegmentRemovedEvent = (
    event: DeltaEvent,
): event is Extract<DeltaEvent, { type: 'segment-removed' }> => {
    return event.type === DELTA_EVENT_TYPES.SEGMENT_REMOVED;
};

export const isDeltaHydrationEvent = (
    event: DeltaEvent,
): event is Extract<DeltaEvent, { type: 'hydration' }> => {
    return event.type === DELTA_EVENT_TYPES.HYDRATION;
};
