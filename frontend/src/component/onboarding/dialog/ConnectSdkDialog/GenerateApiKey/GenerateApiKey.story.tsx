import type { Story, StoryMeta } from 'component/stories/types';
import { GenerateApiKey } from './GenerateApiKey';

export const meta: StoryMeta = {
    title: 'Onboarding / GenerateApiKey',
    background: 'paper',
};

export const Default: Story = () => (
    <GenerateApiKey
        projectId='my-project'
        environments={['production', 'development', 'staging']}
        sdk={{ type: 'client' }}
        onApiKeyChange={(apiKey) => console.log('API key changed:', apiKey)}
        onNext={() => console.log('Next clicked')}
    />
);
