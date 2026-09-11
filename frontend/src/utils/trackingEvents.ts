import type { EventProps } from 'contexts/EventTrackerContext';

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
    | 'export-import'
    | 'api-tokens'
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
    | 'prod-guard'
    | 'list-filters';

// The hook sets eventType and action from the declaration, so don't pass them as props.
export type TrackingProps = EventProps & {
    eventType?: never;
    action?: never;
};

// Every action emits as a row of the same event, so funnels need no join.
export type Tracking = {
    event: CustomEvents;
    type?: string;
    props?: TrackingProps;
};

export type TrackingAction =
    // Only for things that later get submitted or dismissed, like a dialog. Not for expand/collapse.
    'opened' | 'submitted' | 'succeeded' | 'failed' | 'dismissed';

export type DialogDismissMethod =
    | 'cancel-button'
    | 'backdrop'
    | 'escape'
    | 'close-icon';

export const dismissMethodFromCloseReason = (
    reason: string | undefined,
): DialogDismissMethod => (reason === 'backdropClick' ? 'backdrop' : 'escape');

// Flight recorder uses these reserved names internally; they are not available for custom events.
export const RESERVED_EVENT_NAMES = {
    pageView: 'pageview',
    pageLeave: 'pageleave',
} as const;

export type ReservedEventName =
    (typeof RESERVED_EVENT_NAMES)[keyof typeof RESERVED_EVENT_NAMES];
