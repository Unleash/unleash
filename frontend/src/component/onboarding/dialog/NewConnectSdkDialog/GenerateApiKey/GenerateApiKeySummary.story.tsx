import type { Story, StoryMeta } from 'component/stories/types';
import { GenerateApiKeySummary } from './GenerateApiKeySummary';

export const meta: StoryMeta = {
    title: 'Onboarding / GenerateApiKeySummary',
    background: 'paper',
};

export const Default: Story = () => (
    <GenerateApiKeySummary apiKey='my-project:production.0efcb2447a1b9f417c90afea8415dd867f1998bea7db9c13714554f3' />
);

export const LongKey: Story = () => (
    <GenerateApiKeySummary apiKey='my-very-long-project-name:some-environment-name.averylongsecretkeythatshouldgettruncated12345' />
);

export const NoKey: Story = () => <GenerateApiKeySummary />;
