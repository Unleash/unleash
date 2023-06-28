import { useCallback, useContext } from 'react';
import { PlausibleContext } from 'contexts/PlausibleContext';
import { EventOptions, PlausibleOptions } from 'plausible-tracker';

/**
 * Allowed event names. Makes it easy to remove, since TS will complain.
 * Add those to Plausible as Custom event goals.
 * @see https://plausible.io/docs/custom-event-goals#2-create-a-custom-event-goal-in-your-plausible-analytics-account
 * @example `'download | 'invite' | 'signup'`
 **/
export type CustomEvents =
    | 'invite'
    | 'upgrade_plan_clicked'
    | 'change_request'
    | 'favorite'
    | 'maintenance'
    | 'message_banner'
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
    | 'playground';

export const usePlausibleTracker = () => {
    const plausible = useContext(PlausibleContext);

    const trackEvent = useCallback(
        (
            eventName: CustomEvents,
            options?: EventOptions | undefined,
            eventData?: PlausibleOptions | undefined
        ) => {
            if (plausible?.trackEvent) {
                plausible.trackEvent(eventName, options, eventData);
            } else {
                if (options?.callback) {
                    options.callback();
                }
            }
        },
        [plausible]
    );

    return { trackEvent };
};
