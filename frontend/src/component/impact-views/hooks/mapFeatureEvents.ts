import type { EventSchema } from 'openapi';
import type { MultimetricFeatureEvent } from 'component/impact-metrics/MultimetricChart/types';

// The flag-flip event types the impact-views chart understands. Shared by the
// followed-features fetch and the window (all-flags) fetch so both stay in sync.
export const FEATURE_TYPES =
    'IS_ANY_OF:feature-environment-enabled,feature-environment-disabled';

// Maps raw search-API events into the chart's `MultimetricFeatureEvent` shape.
// `environment` comes from the caller (the view's environment) rather than the
// event, matching how the followed-features overlay has always done it.
export const mapFeatureEvents = (
    events: EventSchema[],
    environment: string,
): MultimetricFeatureEvent[] =>
    events.map((event) => ({
        id: event.id,
        timestamp: new Date(event.createdAt).getTime(),
        type: event.type as MultimetricFeatureEvent['type'],
        label: event.label ?? event.type,
        createdBy: event.createdBy,
        featureName: event.featureName ?? '',
        environment,
    }));
