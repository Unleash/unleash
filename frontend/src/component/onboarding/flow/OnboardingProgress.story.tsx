import type { Story, StoryMeta } from 'component/stories/types';
import { OnboardingProgress } from './OnboardingProgress';

export const meta: StoryMeta = {
    title: 'Onboarding / OnboardingProgress',
    background: 'paper',
};

export const JustStarted: Story = () => (
    <OnboardingProgress step={0} maxSteps={3} onDismiss={() => {}} />
);

export const FirstStep: Story = () => (
    <OnboardingProgress step={1} maxSteps={3} onDismiss={() => {}} />
);

export const SecondStep: Story = () => (
    <OnboardingProgress step={2} maxSteps={3} onDismiss={() => {}} />
);

export const Completed: Story = () => (
    <OnboardingProgress step={3} maxSteps={3} onDismiss={() => {}} />
);
