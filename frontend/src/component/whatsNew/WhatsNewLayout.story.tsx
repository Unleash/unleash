import type { Story, StoryMeta } from 'component/stories/types';
import { WhatsNewLayout } from './WhatsNewLayout';
import { features, type Feature } from './features';

export const meta: StoryMeta = {
    title: 'WhatsNew / WhatsNewLayout',
    background: 'application',
};

const releasedOnly = features.filter((f) => f.phase === 'released');
const inProgressOnly = features.filter((f) => f.phase !== 'released');

export const Current: Story = () => <WhatsNewLayout features={features} />;

export const OnlyReleased: Story = () => (
    <WhatsNewLayout features={releasedOnly} />
);

export const OnlyInProgress: Story = () => (
    <WhatsNewLayout features={inProgressOnly} />
);

export const Empty: Story = () => <WhatsNewLayout features={[]} />;

const longCopy: Feature[] = [
    {
        phase: 'released',
        title: 'A noticeably longer release title that should wrap across two lines on narrow viewports',
        description:
            'This card stretches the layout: a long description that runs across several lines to confirm spacing, line-height, and the relationship between the header, the released date, the body copy and the docs link below stays visually balanced.',
        releasedAt: '2026-06-01',
        docsLink: 'https://docs.getunleash.io',
    },
    {
        phase: 'beta',
        title: 'Release plans',
        description:
            'Coordinate gradual rollouts across environments with a guided plan: define milestones, target audiences, and progress automatically.',
    },
];

export const LongCopy: Story = () => <WhatsNewLayout features={longCopy} />;
