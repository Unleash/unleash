import type { EventProps } from 'contexts/EventTrackerContext';

/**
 * The `event` of a journey: the area of the application it belongs to, like `flag-actions` or
 * `segments`. Before adding one, check whether the area already has an event here and reuse it.
 *
 * Many of these are legacy one-off events, still used by individual `trackEvent` calls that
 * predate the idea of journeys. Do not build new tracking on those; they get migrated as their code is
 * touched.
 */
export type CustomEvents =
    | 'invite'
    | 'upgrade-plan-clicked'
    | 'read-about'
    | 'change-request'
    | 'favorite'
    | 'maintenance'
    | 'banner'
    | 'hidden-environment'
    | 'project-overview'
    | 'unknown-ui-error'
    | 'export-import'
    | 'api-tokens'
    | 'project-stickiness-set'
    | 'notifications'
    | 'batch-operations'
    | 'strategy-title'
    | 'default-strategy'
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
    | 'suggestion-strategy-add'
    | 'playground'
    | 'feature-type-edit'
    | 'strategy-variants'
    | 'search-filter-suggestions'
    | 'project-metrics'
    | 'open-integration'
    | 'feature-naming-pattern'
    | 'project-mode'
    | 'dependent-features'
    | 'search-filter'
    | 'search-feature-buttons'
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
    | 'upgrade-trial-dialog'
    | 'upgrade-trial-billing-page'
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
    | 'list-filters'
    | 'event-log';

/**
 * One verb per meaning. A new verb is only added when it is not a synonym of one already here:
 * show and hide are toggle, discard is delete, assign is add, change is edit.
 */
export type TrackingVerb =
    | 'create'
    | 'edit'
    | 'delete'
    | 'archive'
    | 'revive'
    | 'clone'
    | 'copy'
    | 'toggle'
    | 'enable'
    | 'filter'
    | 'search'
    | 'sort'
    | 'paginate'
    | 'export'
    | 'import'
    | 'add'
    | 'remove'
    | 'select'
    | 'view'
    | 'open'
    | 'confirm'
    | 'snooze'
    | 'complete'
    | 'uncomplete'
    | 'send'
    | 'approve'
    | 'reject'
    | 'apply'
    | 'schedule'
    | 'cancel';

/**
 * The `type` of a journey: what the user is trying to do, e.g. `create-flag` or
 * `delete-strategy`. Use the same type for the same thing no matter where it happens. If the
 * create flag form shows up both on a page and in a modal, it is still `create-flag`, and
 * where it was shown is a prop.
 *
 * Do not split one thing into two types because it has two directions or two options. A
 * switch is `toggle-something` with `newState` in props, not `show-something` and
 * `hide-something`. The same goes for any choice the user makes along the way, e.g. which
 * option they picked: that is a prop on the event, not a new type.
 */
export type TrackingType = `${TrackingVerb}-${string}`;

export type DialogDismissMethod =
    | 'cancel-button'
    | 'backdrop'
    | 'escape'
    | 'close-icon';

/**
 * Extra facts about the journey that go on every event. The hook sets `eventType` and `action`
 * itself from the Tracking object, so those two cannot be passed here.
 *
 * A few rules for what goes in. Use a string union for state, e.g.
 * `newState: 'expanded' | 'collapsed'` rather than `expanded: true`, because you might add a
 * third state later and a boolean cannot grow into that. Counts are plain numbers named
 * `<thing>Count`. Do not send durations, every event already has a timestamp and the
 * difference can be worked out later. Never send customer data, i.e. no flag names, project
 * names, ids or free text. Send the kind of thing or how many there were instead.
 */
export type TrackingProps = EventProps & {
    eventType?: never;
    action?: never;
};

/**
 * One journey. Declare one exported object per type in a `<domain>Tracking.ts` file next to
 * the feature, e.g. `flagActionsTracking.ts`, and pass it to `useTracking`. A page or table
 * that sends events on its own, without one control, is still a journey and still gets a type,
 * e.g. `view-dashboard`.
 *
 * Put a prop here when it is known before the journey starts and should be on every event,
 * e.g. which page the form is on. Put it on the call instead when it is only known at that
 * moment, e.g. `method` on dismissed or `newState` on succeeded.
 */
export type Tracking = {
    event: CustomEvents;
    type: TrackingType;
    props?: TrackingProps;
};

/**
 * How far the user got in the journey.
 *
 * In most cases the one you will call yourself is `succeeded`, for a one-off action like
 * expanding a section or copying something.
 *
 * `submitted`, `succeeded` and `failed` together are for API calls: submitted is the intent,
 * the other two are the result. `.mutation` on the tracker sends all three for you, so you
 * rarely write them by hand.
 *
 * `opened` and `dismissed` are for dialogs. Dialogue and SidebarModal send them for you when
 * you pass `tracking`. A custom dialog or a cancel button inside the content sends them itself.
 * A form on its own page does not send them, we already have pageviews for that.
 */
export type TrackingAction =
    | 'opened'
    | 'submitted'
    | 'succeeded'
    | 'failed'
    | 'dismissed';

export const dismissMethodFromCloseReason = (
    reason: string | undefined,
): DialogDismissMethod => (reason === 'backdropClick' ? 'backdrop' : 'escape');

export const RESERVED_EVENT_NAMES = {
    pageView: 'pageview',
    pageLeave: 'pageleave',
} as const;

export type ReservedEventName =
    (typeof RESERVED_EVENT_NAMES)[keyof typeof RESERVED_EVENT_NAMES];
