import { useCallback, useContext } from 'react';
import { PlausibleContext } from 'contexts/PlausibleContext';
import type { EventOptions, PlausibleOptions } from 'plausible-tracker';

/**
 * Allowed event names. Makes it easy to remove, since TS will complain.
 * Add those to Plausible as Custom event goals.
 * @see https://plausible.io/docs/custom-event-goals#2-create-a-custom-event-goal-in-your-plausible-analytics-account
 * @example `'download | 'invite' | 'signup'`
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
    | 'context-usage'
    | 'segment-usage'
    | 'strategy-add'
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
    | 'new-in-unleash-click'
    | 'new-in-unleash-dismiss'
    | 'search-opened'
    | 'events-exported'
    | 'event-timeline'
    | 'onboarding'
    | 'personal-dashboard'
    | 'order-environments'
    | 'project-navigation'
    | 'productivity-report'
    | 'release-management'
    | 'release-templates-banner'
    | 'feature-links'
    | 'project-cleanup'
    | 'project-list-view-toggle'
    | 'impact-metrics';

export const usePlausibleTracker = () => {
    const plausible = useContext(PlausibleContext);

    const trackEvent = useCallback(
        (
            eventName: CustomEvents,
            options?: EventOptions | undefined,
            eventData?: PlausibleOptions | undefined,
        ) => {
            if (plausible?.trackEvent) {
                plausible.trackEvent(eventName, options, eventData);
            } else {
                if (options?.callback) {
                    options.callback();
                }
            }
        },
        [plausible],
    );

    return { trackEvent };
};
