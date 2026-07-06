import { formatAssetPath } from 'utils/formatPath';
import ImpactMetricsImage from 'assets/img/new-in-unleash/impact-metrics.png';
import MilestoneImage from 'assets/img/new-in-unleash/milestone.png';
import McpImage from 'assets/img/new-in-unleash/mcp.png';

type FeatureBase = {
    title: string;
    description: string;
};

export type Feature = FeatureBase &
    (
        | {
              phase: 'released';
              releasedAt: string;
              docsLink?: string;
              previewImageSrc?: string;
          }
        | { phase: 'beta' | 'exploring' }
    );

export type ReleasedFeature = Extract<Feature, { phase: 'released' }>;
export type InProgressFeature = Extract<
    Feature,
    { phase: 'beta' | 'exploring' }
>;

export const features: Feature[] = [
    {
        title: 'Impact metrics',
        description:
            'Track error rates, latency, and other application signals directly inside Unleash. Use them to automatically advance rollout milestones — or pause when something spikes.',
        phase: 'released',
        releasedAt: '2026-06-09',
        docsLink: 'https://docs.getunleash.io/concepts/impact-metrics',
        previewImageSrc: formatAssetPath(ImpactMetricsImage),
    },
    {
        title: 'Safeguards and milestone progression',
        description:
            'Set conditions to progress rollout in a release template automatically. Safeguards pause the rollout if metrics exceed a threshold, so you can release with confidence.',
        phase: 'released',
        releasedAt: '2026-06-09',
        docsLink:
            'https://docs.getunleash.io/concepts/impact-metrics#automate-release-progression',
        previewImageSrc: formatAssetPath(MilestoneImage),
    },
    {
        title: 'Unleash MCP server',
        description:
            'Connect your AI coding assistant to Unleash for safe, structured feature flag management, from flag creation through to cleanup.',
        phase: 'released',
        releasedAt: '2026-05-26',
        docsLink: 'https://docs.getunleash.io/integrate/mcp',
        previewImageSrc: formatAssetPath(McpImage),
    },
    {
        title: 'Service Now integration',
        description:
            'We are currently looking into how a Service Now integration with Unleash could look like, and we would like to understand the various needs for this.',
        phase: 'exploring',
    },
];
