import { styled } from '@mui/material';
import type { Story, StoryMeta } from 'component/stories/types';
import { FeatureCard } from './FeatureCard';
import { features, type ReleasedFeature } from './features';

export const meta: StoryMeta = {
    title: 'WhatsNew / FeatureCard',
    background: 'application',
};

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    maxWidth: 760,
}));

const samplePreviewSrc =
    features.find(
        (f): f is ReleasedFeature =>
            f.phase === 'released' && Boolean(f.previewImageSrc),
    )?.previewImageSrc ?? '';

export const Current: Story = () => (
    <StyledContainer>
        {features
            .toSorted((a, b) => a.title.localeCompare(b.title))
            .map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
            ))}
    </StyledContainer>
);

export const PhaseReleased: Story = () => (
    <FeatureCard
        feature={{
            phase: 'released',
            title: 'Unleash MCP server',
            description:
                'Connect your AI coding assistant to Unleash for safe, structured feature flag management, from flag creation through to cleanup.',
            releasedAt: '2026-05-26',
            docsLink: 'https://docs.getunleash.io/integrate/mcp',
        }}
    />
);

export const PhaseReleasedWithPreview: Story = () => (
    <FeatureCard
        feature={{
            phase: 'released',
            title: 'Insights dashboard refresh',
            description:
                'A redesigned insights surface with faster filters, sharable views, and trend overlays you can pin to your dashboard.',
            releasedAt: '2026-06-12',
            docsLink: 'https://docs.getunleash.io/reference/insights',
            previewImageSrc: samplePreviewSrc,
        }}
    />
);

export const PhaseReleasedWithoutDocs: Story = () => (
    <FeatureCard
        feature={{
            phase: 'released',
            title: 'Quiet release',
            description:
                'Some releases are small enough that the changelog entry is all the documentation you need.',
            releasedAt: '2026-04-02',
        }}
    />
);

export const PhaseReleasedLongCopy: Story = () => (
    <FeatureCard
        feature={{
            phase: 'released',
            title: 'A noticeably longer release title that should wrap across two lines on narrow viewports',
            description:
                'This card stretches the layout: a long description that runs across several lines to confirm spacing, line-height, and the relationship between the header, the released date, the body copy and the docs link below stays visually balanced. It should not feel cramped or float awkwardly when the preview column is absent.',
            releasedAt: '2026-01-15',
            docsLink: 'https://docs.getunleash.io',
        }}
    />
);

export const PhaseBeta: Story = () => (
    <FeatureCard
        feature={{
            phase: 'beta',
            title: 'Release plans',
            description:
                'Coordinate gradual rollouts across environments with a guided plan: define milestones, target audiences, and progress automatically.',
        }}
    />
);

export const Exploring: Story = () => (
    <FeatureCard
        feature={{
            phase: 'exploring',
            title: 'Service Now integration',
            description:
                'We are currently looking into how a Service Now integration with Unleash could look like, and we would like to understand the various needs for this.',
        }}
    />
);
