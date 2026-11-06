import type { Story, StoryMeta } from 'component/stories/types';
import { OnboardingResources } from './OnboardingResources.tsx';

export const meta: StoryMeta = {
    title: 'PersonalDashboard / OnboardingResources',
    background: 'application',
};

export const Enterprise: Story = () => (
    <OnboardingResources edition='enterprise' />
);

export const OpenSource: Story = () => <OnboardingResources edition='oss' />;

export const Narrow: Story = () => (
    <div style={{ maxWidth: 360 }}>
        <OnboardingResources edition='oss' />
    </div>
);
