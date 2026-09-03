import type { FeatureStatus } from './getFeatureStatus.ts';

export type FeatureStatusText = {
    label: string;
    description?: string;
};

const pausedDescriptions = {
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
                description: 'A non-production environment is enabled',
            };
        case 'noStrategies':
            return {
                label: 'No strategies',
                description:
                    status.environment === 'production'
                        ? 'No strategies added in the production environment'
                        : 'No strategies in non-production environment',
            };
        case 'noEnabledStrategies':
            return {
                label: 'No enabled strategies',
                description:
                    'All strategies in non-production environments are disabled',
            };
        case 'paused':
            return {
                label: 'Paused',
                description: pausedDescriptions[status.environment],
            };
        case 'partialProduction':
            return {
                label: `In ${status.enabledEnvironments.length} out of ${status.total} production environments`,
                description: `Enabled in: ${status.enabledEnvironments.join(', ')}`,
            };
        case 'noProductionEnvironments':
            return { label: 'No production environments' };
        case 'milestone':
            return { label: milestoneLabel(status) };
        case 'ok':
            return { label: '–', description: 'No issues detected' };
        case 'unknown':
            return {
                label: '–',
                description: 'We are lacking data about this flag',
            };
        default: {
            const exhaustiveCheck: never = status;
            return exhaustiveCheck;
        }
    }
};
