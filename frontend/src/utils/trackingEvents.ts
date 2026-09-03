import type {
    EventProps,
    TrackEventOptions,
} from 'contexts/EventTrackerContext';
import { requestFailureProps } from 'utils/requestFailureProps';

/**
 * Allowed event names for analytics trackers.
 * New events must be added here and registered in Plausible as Custom event goals.
 * @see https://plausible.io/docs/custom-event-goals#2-create-a-custom-event-goal-in-your-plausible-analytics-account
 **/
export type CustomEvents =
    | 'invite'
    | 'upgrade_plan_clicked'
    | 'read_about'
    | 'change_request'
    | 'favorite'
    | 'maintenance'
    | 'banner'
    | 'hidden_environment'
    | 'project_overview'
    | 'suggest_tags'
    | 'unknown_ui_error'
    | 'export_import'
    | 'project_api_tokens'
    | 'project_stickiness_set'
    | 'notifications'
    | 'batch_operations'
    | 'strategyTitle'
    | 'default_strategy'
    | 'demo'
    | 'demo-start'
    | 'demo-close'
    | 'demo-finish'
    | 'demo-see-plans'
    | 'demo-see-plan'
    | 'demo-restart'
    | 'demo-view-demo-link'
    | 'demo-start-topic'
    | 'demo-ask-questions'
    | 'demo-open-demo-web'
    | 'demo-open-walkthrough-guide'
    | 'context-usage'
    | 'segment-usage'
    | 'strategy-add'
    | 'edit-milestone-strategy'
    | 'suggestion-strategy-add'
    | 'playground'
    | 'feature-type-edit'
    | 'strategy-variants'
    | 'search-filter-suggestions'
    | 'project-metrics'
    | 'open-integration'
    | 'feature-naming-pattern'
    | 'project-mode'
    | 'dependent_features'
    | 'playground_token_input_used'
    | 'search-filter'
    | 'search-feature-buttons'
    | 'new-strategy-form'
    | 'feedback'
    | 'feature-metrics'
    | 'search-bar'
    | 'sdk-reporting'
    | 'insights-share'
    | 'many-strategies'
    | 'sdk-banner'
    | 'feature-lifecycle'
    | 'command-bar'
    | 'search-opened'
    | 'events-exported'
    | 'event-timeline'
    | 'onboarding'
    | 'personal-dashboard'
    | 'order-environments'
    | 'project-navigation'
    | 'productivity-report'
    | 'release-management'
    | 'feature-links'
    | 'project-cleanup'
    | 'project-list-view-toggle'
    | 'impact-metrics'
    | 'impact-metrics-safeguards-splash'
    | 'release-management-splash'
    | 'upgrade_trial_dialog'
    | 'upgrade_trial_billing_page'
    | 'new-template-from-add-strategy'
    | 'flagpage-impact-metrics'
    | 'signup-dialog'
    | 'signup-dialog-error'
    | 'quick-tour-demo'
    | 'safeguards'
    | 'remote-mcp'
    | 'external-impact-metrics'
    | 'help-resources'
    | 'onboarding-checklist'
    | 'access-requests-notification'
    | 'whats-new-page'
    | 'search-docs'
    | 'flag-actions'
    | 'flag-tags'
    | 'flag-strategy'
    | 'flag-environment-toggled'
    | 'project-status'
    | 'flag-creation'
    | 'segments'
    | 'context-fields'
    | 'docs-opened'
    | 'api-command-copied'
    | 'project-settings'
    | 'project-access'
    | 'project-environments'
    | 'project-actions'
    | 'flags-list'
    | 'dialog-dismissed';

// Every action emits as a row of the same event, so funnels need no join.
export type Tracking = {
    event: CustomEvents;
    type?: string;
    props?: EventProps;
};

export type TrackingAction =
    | 'opened'
    | 'submitted'
    | 'succeeded'
    | 'failed'
    | 'dismissed'
    | 'copied';

// eventType and action are stamped from the declaration; passing them would fight it.
export type TrackingProps = EventProps & {
    eventType?: never;
    action?: never;
};

type TrackEvent = (event: CustomEvents, options?: TrackEventOptions) => void;

export const emitTrackingAction = (
    trackEvent: TrackEvent,
    tracking: Tracking,
    action: TrackingAction,
    props?: TrackingProps,
) => {
    trackEvent(tracking.event, {
        props: {
            ...tracking.props,
            ...props,
            ...(tracking.type ? { eventType: tracking.type } : {}),
            action,
        },
    });
};

// Rethrows: the caller keeps owning toasts and error handling. Call this directly only
// when the eventType is chosen inside the handler; useTracking binds it at render.
export const runTrackedMutation = async <T>(
    trackEvent: TrackEvent,
    tracking: Tracking,
    fn: () => Promise<T>,
    props?: TrackingProps,
): Promise<T> => {
    emitTrackingAction(trackEvent, tracking, 'submitted', props);
    try {
        const result = await fn();
        emitTrackingAction(trackEvent, tracking, 'succeeded', props);
        return result;
    } catch (error: unknown) {
        emitTrackingAction(trackEvent, tracking, 'failed', {
            ...props,
            ...requestFailureProps(error),
        });
        throw error;
    }
};

export type DialogDismissMethod =
    | 'cancel-button'
    | 'backdrop'
    | 'escape'
    | 'close-icon';

// Flight recorder uses these reserved names internally; they are not available for custom events.
export const RESERVED_EVENT_NAMES = {
    pageView: 'pageview',
    pageLeave: 'pageleave',
} as const;

export type ReservedEventName =
    (typeof RESERVED_EVENT_NAMES)[keyof typeof RESERVED_EVENT_NAMES];
