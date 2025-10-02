export interface UsageMetric {
    id: string;
    label: string;
    includedCurrent: number;
    includedMax: number;
    includedUnit: string;
    actual?: string;
    amount: number;
}

export const defaultMetrics: UsageMetric[] = [
    {
        id: 'frontend-traffic',
        label: 'Frontend traffic',
        includedCurrent: 10,
        includedMax: 10,
        includedUnit: 'M requests',
        actual: '1,085M requests',
        amount: 5425,
    },
    {
        id: 'service-connections',
        label: 'Service connections',
        includedCurrent: 7,
        includedMax: 7,
        includedUnit: 'connections',
        actual: '20 connections',
        amount: 0,
    },
    {
        id: 'release-templates',
        label: 'Release templates',
        includedCurrent: 3,
        includedMax: 5,
        includedUnit: 'templates',
        amount: 0,
    },
    {
        id: 'edge-frontend-traffic',
        label: 'Edge Frontend Traffic',
        includedCurrent: 2,
        includedMax: 10,
        includedUnit: 'M requests',
        amount: 0,
    },
    {
        id: 'edge-service-connections',
        label: 'Edge Service Connections',
        includedCurrent: 5,
        includedMax: 5,
        includedUnit: 'connections',
        amount: 0,
    },
];

export const formatCurrency = (value: number) =>
    `$${value.toLocaleString('en-US')}`;
