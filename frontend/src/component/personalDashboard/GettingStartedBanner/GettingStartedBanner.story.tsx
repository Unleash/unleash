import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import { PayloadType, type Variant } from 'utils/variants';
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

const Setup = ({
    children,
    flag = true,
}: {
    children: ReactNode;
    flag?: boolean | Variant;
}) => (
    <SWRConfig
        value={{
            provider: () => new Map(),
            fallback: {
                [formatApiPath('api/admin/ui-config')]: {
                    flags: {
                        dashboardOnboardingAI: flag,
                    },
                },
            },
            revalidateOnMount: false,
        }}
    >
        {children}
    </SWRConfig>
);

const instanceContext: SetupPromptContext = {
    remoteMcpEnabled: true,
    permissions: [{ permission: ADMIN }],
    version: '8.3.0',
    isOss: false,
    environment: 'development',
};

export const DefaultProject: Story = () => (
    <Setup>
        <GettingStartedBanner
            instanceUrl='https://example.com/unleash'
            projectId='default'
            promptContext={instanceContext}
        />
    </Setup>
);

export const WithResources: Story = () => (
    <Setup>
        <Stack spacing={2}>
            <GettingStartedBanner
                instanceUrl='https://example.com/unleash'
                projectId='default'
                promptContext={instanceContext}
            />
            <OnboardingResources edition='enterprise' />
        </Stack>
    </Setup>
);

export const Narrow: Story = () => (
    <Setup>
        <div style={{ maxWidth: 360 }}>
            <GettingStartedBanner
                instanceUrl='https://example.com/unleash'
                projectId='default'
                promptContext={instanceContext}
            />
        </div>
    </Setup>
);

export const RemoteMcpDisabled: Story = () => (
    <Setup>
        <GettingStartedBanner
            instanceUrl='https://example.com/unleash'
            projectId='default'
            promptContext={{ ...instanceContext, remoteMcpEnabled: false }}
        />
    </Setup>
);

export const UnknownMcpStatus: Story = () => (
    <Setup>
        <GettingStartedBanner
            instanceUrl='https://example.com/unleash'
            projectId='default'
            promptContext={{
                isOss: false,
                permissions: [
                    { permission: CREATE_FEATURE, project: 'default' },
                ],
            }}
        />
    </Setup>
);

export const ManualOnly: Story = () => (
    <Setup flag={false}>
        <GettingStartedBanner
            instanceUrl='https://example.com/unleash'
            projectId='default'
            promptContext={instanceContext}
        />
    </Setup>
);

export const PromptOverride: Story = () => (
    <Setup
        flag={{
            name: 'custom-prompt',
            enabled: true,
            payload: {
                type: PayloadType.STRING,
                value: 'Help me connect an Unleash flag to my existing application. Use the instance context below and follow the current setup instructions at https://github.com/Unleash/unleash-mcp.',
            },
        }}
    >
        <GettingStartedBanner
            instanceUrl='https://example.com/unleash'
            projectId='default'
            promptContext={instanceContext}
        />
    </Setup>
);
