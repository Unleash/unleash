import type { ReactNode } from 'react';

type FeatureBase = {
    title: string;
    description: string;
    preview?: ReactNode;
    docsLink?: string;
};

export type Feature = FeatureBase &
    (
        | { phase: 'released'; releasedAt: string }
        | { phase: 'beta' | 'exploring' }
    );

export type ReleasedFeature = Extract<Feature, { phase: 'released' }>;
export type InProgressFeature = Extract<
    Feature,
    { phase: 'beta' | 'exploring' }
>;

export const features: Feature[] = [
    {
        title: 'Unleash MCP server',
        description:
            'Connect your AI coding assistant to Unleash for safe, structured feature flag management, from flag creation through to cleanup.',
        phase: 'released',
        releasedAt: '2026-05-26',
        docsLink: 'https://docs.getunleash.io/integrate/mcp',
    },
    {
        title: 'Service Now integration',
        description:
            'We are currently looking into how a Service Now integration with Unleash could look like, and we would like to understand the various needs for this.',
        phase: 'exploring',
    },
];
