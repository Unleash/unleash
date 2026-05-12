import type { Story, StoryMeta } from 'component/stories/types';
import { GenerateApiKeyStepSummary } from './GenerateApiKeyStepSummary';

export const meta: StoryMeta = {
    title: 'Onboarding / GenerateApiKeyStepSummary',
    background: 'paper',
};

export const Default: Story = () => (
    <GenerateApiKeyStepSummary apiKey='my-project:production.0efcb2447a1b9f417c90afea8415dd867f1998bea7db9c13714554f3' />
);

export const LongKey: Story = () => (
    <GenerateApiKeyStepSummary apiKey='my-very-long-project-name:some-environment-name.averylongsecretkeythatshouldgettruncated12345' />
);

export const NoKey: Story = () => <GenerateApiKeyStepSummary />;
