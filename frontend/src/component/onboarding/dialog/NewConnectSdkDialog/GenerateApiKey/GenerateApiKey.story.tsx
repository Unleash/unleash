import type { Story, StoryMeta } from 'component/stories/types';
import { GenerateApiKeyContent } from './GenerateApiKey';

export const meta: StoryMeta = {
    title: 'Onboarding / GenerateApiKey',
    background: 'paper',
};

const environments = ['production', 'development', 'staging'];

export const NoToken: Story = () => (
    <GenerateApiKeyContent
        environments={environments}
        environment='production'
        onEnvSelect={(env) => console.log('Env selected:', env)}
        parsedToken={null}
        creatingToken={false}
        generateAPIKey={() => console.log('Generate API key')}
        onDone={() => console.log('Next')}
    />
);

export const FetchingTokens: Story = () => (
    <GenerateApiKeyContent
        environments={environments}
        environment='production'
        onEnvSelect={(env) => console.log('Env selected:', env)}
        parsedToken={null}
        fetchingTokens={true}
        creatingToken={false}
        generateAPIKey={() => console.log('Generate API key')}
        onDone={() => console.log('Next')}
    />
);

export const GeneratingToken: Story = () => (
    <GenerateApiKeyContent
        environments={environments}
        environment='production'
        onEnvSelect={(env) => console.log('Env selected:', env)}
        parsedToken={null}
        creatingToken={true}
        generateAPIKey={() => console.log('Generate API key')}
        onDone={() => console.log('Next')}
    />
);

export const WithToken: Story = () => (
    <GenerateApiKeyContent
        environments={environments}
        environment='production'
        onEnvSelect={(env) => console.log('Env selected:', env)}
        parsedToken={{
            project: 'my-project',
            environment: 'production',
            secret: '0efcb2447a1b9f417c90afea8415dd867f1998bea7db9c13714554f3',
        }}
        creatingToken={false}
        generateAPIKey={() => console.log('Generate API key')}
        onDone={() => console.log('Next')}
    />
);
