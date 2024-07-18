/**
 * @deprecated remove with insightsV2 flag
 */
export const chartInfo = {
    totalUsers: {
        title: 'Total users',
        tooltip: 'Total number of current users.',
    },
    usersInProject: {
        title: 'Users in project',
        tooltip: 'Average number of users for selected projects.',
    },
    avgUsersPerProject: {
        title: 'Users per project on average',
        tooltip: 'Number of users in selected projects.',
    },
    users: {
        title: 'Users',
        tooltip: 'How the number of users changes over time.',
    },
    usersPerProject: {
        title: 'Users per project',
        tooltip:
            'How the number of users changes over time for the selected projects.',
    },
    totalFlags: {
        title: 'Total flags',
        tooltip:
            'Active flags (not archived) that currently exist across the selected projects.',
    },
    flags: {
        title: 'Number of flags',
        tooltip:
            'How the number of flags has changed over time across all projects.',
    },
    flagsPerProject: {
        title: 'Flags per project',
        tooltip:
            'How the number of flags changes over time for the selected projects.',
    },
    averageHealth: {
        title: 'Average health',
        tooltip:
            'Average health is the current percentage of flags in the selected projects that are not stale or potentially stale.',
    },
    overallHealth: {
        title: 'Overall Health',
        tooltip:
            'How the overall health changes over time across all projects.',
    },
    healthPerProject: {
        title: 'Health per project',
        tooltip:
            'How the overall health changes over time for the selected projects.',
    },
    medianTimeToProduction: {
        title: 'Median time to production',
        tooltip:
            'How long does it currently take on average from when a feature flag was created until it was enabled in a "production" type environment. This is calculated only from feature flags of the type "release" and is the median across the selected projects.',
    },
    timeToProduction: {
        title: 'Time to production',
        tooltip:
            'How the median time to production changes over time across all projects.',
    },
    timeToProductionPerProject: {
        title: 'Time to production per project',
        tooltip:
            'How the average time to production changes over time for the selected projects.',
    },
    metrics: {
        title: 'Flag evaluation metrics',
        tooltip:
            'Summary of all flag evaluations reported by SDKs across all projects.',
    },
    metricsPerProject: {
        title: 'Flag evaluation metrics per project',
        tooltip:
            'Summary of all flag evaluations reported by SDKs for the selected projects.',
    },
    updates: {
        title: 'Updates per environment type',
        tooltip: 'Summary of all configuration updates per environment type.',
    },
};
