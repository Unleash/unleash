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
    | 'dialog-dismissed';

// A dialog is identified by the journey it serves: the journey's event name plus,
// where the surface has operation variants, its eventType. Dismissals emit as rows
// of that journey with action 'dismissed', so funnels need no join.
export type DialogTracking = {
    event: CustomEvents;
    type?: string;
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
