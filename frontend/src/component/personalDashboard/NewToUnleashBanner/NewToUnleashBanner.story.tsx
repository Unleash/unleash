import type { Story, StoryMeta } from 'component/stories/types';
import { IntroProvider } from 'component/onboarding/intro/IntroProvider.tsx';
import { NewToUnleashBanner } from './NewToUnleashBanner.tsx';

export const meta: StoryMeta = {
    title: 'PersonalDashboard / NewToUnleashBanner',
    background: 'application',
};

export const Default: Story = () => (
    <IntroProvider>
        <NewToUnleashBanner />
    </IntroProvider>
);

export const Narrow: Story = () => (
    <IntroProvider>
        <div style={{ maxWidth: 360 }}>
            <NewToUnleashBanner />
        </div>
    </IntroProvider>
);
