import type { Tracking } from 'utils/trackingEvents';

type HelpMenuPlacement = 'header' | 'sidebar';

export const openHelpMenuTracking = (
    placement: HelpMenuPlacement,
): Tracking => ({
    event: 'help-resources',
    type: 'open-help-menu',
    props: { placement },
});

export const selectHelpResourceTracking = (
    placement: HelpMenuPlacement,
): Tracking => ({
    event: 'help-resources',
    type: 'select-help-resource',
    props: { placement },
});
