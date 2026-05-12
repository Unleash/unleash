import type { Story, StoryMeta } from 'component/stories/types';
import { TokenExplanation } from './TokenExplanation';

export const meta: StoryMeta = {
    title: 'Onboarding / TokenExplanation',
    background: 'paper',
};

export const Default: Story = () => (
    <TokenExplanation
        project='my-project-here'
        environment='production'
        secret='0efcb2447a1b9f417c90afea8415dd867f1998bea7db9c13714554f3'
    />
);
