import type { Story, StoryMeta } from 'component/stories/types';
import { Stack } from '@mui/material';
import { OnboardingResources } from '../OnboardingResources/OnboardingResources.tsx';
import { GettingStartedBanner } from './GettingStartedBanner.tsx';
import type { SetupPromptContext } from './getSetupPrompt.ts';
import {
    ADMIN,
    CREATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';

export const meta: StoryMeta = {
    title: 'PersonalDashboard / GettingStartedBanner',
    background: 'application',
};

const instanceContext: SetupPromptContext = {
    remoteMcpEnabled: true,
    permissions: [{ permission: ADMIN }],
    version: '8.3.0',
    isOss: false,
    environment: 'development',
};

export const DefaultProject: Story = () => (
    <GettingStartedBanner
        instanceUrl='https://example.com/unleash'
        projectId='default'
        promptContext={instanceContext}
    />
);

export const WithResources: Story = () => (
    <Stack spacing={2}>
        <GettingStartedBanner
            instanceUrl='https://example.com/unleash'
            projectId='default'
            promptContext={instanceContext}
        />
        <OnboardingResources edition='enterprise' />
    </Stack>
);

export const Narrow: Story = () => (
    <div style={{ maxWidth: 360 }}>
        <GettingStartedBanner
            instanceUrl='https://example.com/unleash'
            projectId='default'
            promptContext={instanceContext}
        />
    </div>
);

export const RemoteMcpDisabled: Story = () => (
    <GettingStartedBanner
        instanceUrl='https://example.com/unleash'
        projectId='default'
        promptContext={{ ...instanceContext, remoteMcpEnabled: false }}
    />
);

export const UnknownMcpStatus: Story = () => (
    <GettingStartedBanner
        instanceUrl='https://example.com/unleash'
        projectId='default'
        promptContext={{
            isOss: false,
            permissions: [{ permission: CREATE_FEATURE, project: 'default' }],
        }}
    />
);
