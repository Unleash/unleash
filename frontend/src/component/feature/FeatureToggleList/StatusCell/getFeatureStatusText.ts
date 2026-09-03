import type { FeatureStatus } from './getFeatureStatus.ts';

export type FeatureStatusText = {
    label: string;
    /** When absent, the status is shown without a tooltip. */
    tooltip?: string;
};

const pausedTooltips = {
    'non-production': 'All non-production environments are disabled',
    any: 'No environment enabled',
    production: 'Production environments are disabled',
} as const;

const milestoneLabel = ({
    name,
    order,
    total,
}: Extract<FeatureStatus, { type: 'milestone' }>) =>
    name
        ? `Milestone: ${name} (${order} of ${total})`
        : `Milestone ${order} of ${total}`;

export const getFeatureStatusText = (
    status: FeatureStatus,
): FeatureStatusText => {
    switch (status.type) {
        case 'noTraffic':
            return {
                label: 'No traffic',
                tooltip: 'A non-production environment is enabled',
            };
        case 'noStrategies':
            return {
                label: 'No strategies',
                tooltip:
                    status.environment === 'production'
                        ? 'No strategies added in the production environment'
                        : 'No strategies in non-production environment',
            };
        case 'noEnabledStrategies':
            return {
                label: 'No enabled strategies',
                tooltip:
                    'All strategies in non-production environments are disabled',
            };
        case 'paused':
            return {
                label: 'Paused',
                tooltip: pausedTooltips[status.environment],
            };
        case 'partialProduction':
            return {
                label: `In ${status.enabledEnvironments.length} out of ${status.total} production environments`,
                tooltip: `Enabled in: ${status.enabledEnvironments.join(', ')}`,
            };
        case 'noProductionEnvironments': {
            const label = 'No production environments';
            return { label, tooltip: label };
        }
        case 'milestone': {
            const label = milestoneLabel(status);
            return { label, tooltip: label };
        }
        case 'ok':
            return { label: '–' };
        case 'unknown':
            return { label: 'N/A' };
        default: {
            const exhaustiveCheck: never = status;
            return exhaustiveCheck;
        }
    }
};
