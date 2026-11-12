import { useState } from 'react';
import { Button } from '@mui/material';
import type { Story, StoryMeta } from 'component/stories/types';
import { IntroProvider } from 'component/onboarding/intro/IntroProvider.tsx';
import { NewToUnleashBannerView } from './NewToUnleashBanner.tsx';

export const meta: StoryMeta = {
    title: 'PersonalDashboard / NewToUnleashBanner',
    background: 'application',
};

const Banner = () => {
    const [dismissed, setDismissed] = useState(false);
    return dismissed ? (
        <Button onClick={() => setDismissed(false)}>Show banner again</Button>
    ) : (
        <NewToUnleashBannerView onDismiss={() => setDismissed(true)} />
    );
};

export const Default: Story = () => (
    <IntroProvider>
        <Banner />
    </IntroProvider>
);

export const Narrow: Story = () => (
    <IntroProvider>
        <div style={{ maxWidth: 360 }}>
            <Banner />
        </div>
    </IntroProvider>
);
