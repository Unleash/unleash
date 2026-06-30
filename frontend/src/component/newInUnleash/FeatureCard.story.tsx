import { styled } from '@mui/material';
import type { Story, StoryMeta } from 'component/stories/types';
import { FeatureCard } from './FeatureCard';

export const meta: StoryMeta = {
    title: 'NewInUnleash / FeatureCard',
    background: 'application',
};

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    maxWidth: 760,
}));

const PreviewPlaceholder = styled('div')(({ theme }) => ({
    width: '100%',
    height: 140,
    borderRadius: theme.shape.borderRadius,
    background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
}));

export const Released: Story = () => (
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

export const ReleasedWithPreview: Story = () => (
    <FeatureCard
        feature={{
            phase: 'released',
            title: 'Insights dashboard refresh',
            description:
                'A redesigned insights surface with faster filters, sharable views, and trend overlays you can pin to your dashboard.',
            releasedAt: '2026-06-12',
            docsLink: 'https://docs.getunleash.io/reference/insights',
            preview: <PreviewPlaceholder>Preview</PreviewPlaceholder>,
        }}
    />
);

export const ReleasedWithoutDocs: Story = () => (
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

export const ReleasedLongCopy: Story = () => (
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

export const Beta: Story = () => (
    <FeatureCard
        feature={{
            phase: 'beta',
            title: 'Release plans',
            description:
                'Coordinate gradual rollouts across environments with a guided plan: define milestones, target audiences, and progress automatically.',
            docsLink: 'https://docs.getunleash.io/reference/release-plans',
        }}
    />
);

export const BetaWithoutDocs: Story = () => (
    <FeatureCard
        feature={{
            phase: 'beta',
            title: 'Beta without docs',
            description:
                'An early-access feature that has not yet been documented publicly — useful to verify the card renders without an Actions row.',
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

export const ExploringWithDocs: Story = () => (
    <FeatureCard
        feature={{
            phase: 'exploring',
            title: 'Exploring with a feedback link',
            description:
                'Some exploration cards link to a discovery doc or a feedback form so customers can opt in to the conversation.',
            docsLink: 'https://docs.getunleash.io',
        }}
    />
);

export const Gallery: Story = () => (
    <Container>
        <FeatureCard
            feature={{
                phase: 'released',
                title: 'Unleash MCP server',
                description:
                    'Connect your AI coding assistant to Unleash for safe, structured feature flag management.',
                releasedAt: '2026-05-26',
                docsLink: 'https://docs.getunleash.io/integrate/mcp',
            }}
        />
        <FeatureCard
            feature={{
                phase: 'released',
                title: 'Insights dashboard refresh',
                description:
                    'A redesigned insights surface with faster filters and sharable views.',
                releasedAt: '2026-06-12',
                docsLink: 'https://docs.getunleash.io/reference/insights',
                preview: <PreviewPlaceholder>Preview</PreviewPlaceholder>,
            }}
        />
        <FeatureCard
            feature={{
                phase: 'beta',
                title: 'Release plans',
                description:
                    'Coordinate gradual rollouts across environments with a guided plan.',
                docsLink: 'https://docs.getunleash.io/reference/release-plans',
            }}
        />
        <FeatureCard
            feature={{
                phase: 'exploring',
                title: 'Service Now integration',
                description:
                    'We are looking into how a Service Now integration with Unleash could look like.',
            }}
        />
    </Container>
);
