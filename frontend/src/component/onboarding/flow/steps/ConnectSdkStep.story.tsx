import type { Story, StoryMeta } from 'component/stories/types';
import { ConnectSdkStep } from './ConnectSdkStep';

export const meta: StoryMeta = {
    title: 'Onboarding / ConnectSdkStep',
    background: 'paper',
};

export const Disabled: Story = () => (
    <ConnectSdkStep
        projectId='my-project'
        setConnectSdkOpen={(...args) => {
            console.log('Open Connect SDK', args);
        }}
        state='disabled'
    />
);

export const Active: Story = () => (
    <ConnectSdkStep
        projectId='my-project'
        setConnectSdkOpen={(...args) => {
            console.log('Open Connect SDK', args);
        }}
        state='active'
    />
);

export const Done: Story = () => (
    <ConnectSdkStep
        projectId='my-project'
        setConnectSdkOpen={(...args) => {
            console.log('Open Connect SDK', args);
        }}
        state='done'
    />
);
