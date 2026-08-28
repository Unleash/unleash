import { useEffect, useState } from 'react';
import { Button, MenuItem, Select, styled } from '@mui/material';
import { useProjectApiTokens } from 'hooks/api/getters/useProjectApiTokens/useProjectApiTokens';
import useProjectApiTokensApi from 'hooks/api/actions/useProjectApiTokensApi/useProjectApiTokensApi';
import useToast from 'hooks/useToast';
import { useEventTracker } from 'hooks/useEventTracker';
import { formatUnknownError } from 'utils/formatUnknownError';
import { TokenExplanation } from './TokenExplanation';
import type { Sdk, SdkType } from '../../sharedTypes';
import type { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';

const SDK_TYPE_LABEL: Record<SdkType, string> = {
    client: 'Backend',
    frontend: 'Frontend',
};

const SpacedContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const SectionBox = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.elevation1,
}));

const SectionHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const SectionTitle = styled('div')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body1.fontSize,
}));

const SectionSubtitle = styled('p')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
}));

const ActionRow = styled('div')({
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
});

export interface IGenerateApiKeyContentProps {
    environments: string[];
    environment: string;
    onEnvSelect: (env: string) => void;
    fetchingTokens?: boolean;
    creatingToken: boolean;
    generateAPIKey: () => void;
    onDone: () => void;
}

export interface IGenerateApiKeyProps {
    projectId: string;
    environments: string[];
    sdk?: Pick<Sdk, 'type'>;
    onApiKeyChange: (apiKey?: string) => void;
    onNext: () => void;
}

export const GenerateApiKey = ({
    projectId,
    environments,
    sdk,
    onApiKeyChange,
    onNext,
}: IGenerateApiKeyProps) => {
    const { trackEvent } = useEventTracker();
    const {
        tokens,
        loading: fetchingTokens,
        refetch: refreshTokens,
    } = useProjectApiTokens(projectId);
    const { createToken, loading: creatingToken } = useProjectApiTokensApi();
    const { setToastApiError } = useToast();
    const [environment, setEnvironment] = useState(environments[0] || '');
    const [createdToken, setCreatedToken] = useState<IApiToken>();

    const existingToken = tokens.find(
        (token) =>
            !token.secure &&
            token.environment === environment &&
            token.type === sdk?.type,
    );
    const currentToken =
        createdToken?.environment === environment &&
        createdToken.type === sdk?.type
            ? createdToken
            : existingToken;
    const tokenDetails = currentToken
        ? {
              project: currentToken.projects[0],
              environment: currentToken.environment,
              secret: currentToken.secret,
          }
        : null;

    useEffect(() => {
        onApiKeyChange(currentToken?.secret);
    }, [currentToken?.secret, onApiKeyChange]);

    if (!sdk) return null;

    const generateAPIKey = async () => {
        try {
            const response = await createToken(
                {
                    environment,
                    type: sdk.type,
                    projects: [projectId],
                    tokenName: `api-key-${projectId}-${environment}`,
                },
                projectId,
            );
            setCreatedToken(await response.json());
            refreshTokens();
            trackEvent('onboarding', {
                props: { eventType: 'api-key-generated' },
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const longestEnv =
        environments.length > 0
            ? Math.max(...environments.map((env) => env.length))
            : 0;

    const loading = fetchingTokens || creatingToken;

    const sdkTypeName = SDK_TYPE_LABEL[sdk.type];

    return (
        <SpacedContainer>
            <SectionBox>
                <SectionHeader>
                    <SectionTitle>First select environment</SectionTitle>
                    <SectionSubtitle>
                        The environment connects to an SDK to retrieve
                        information.
                    </SectionSubtitle>
                </SectionHeader>
                <Select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    size='large'
                    inputProps={{ 'aria-label': 'Select environment' }}
                    sx={{ minWidth: `${longestEnv + 5}ch` }}
                >
                    {environments.map((env) => (
                        <MenuItem key={env} value={env}>
                            {env}
                        </MenuItem>
                    ))}
                </Select>
            </SectionBox>

            <SectionBox>
                <SectionHeader>
                    {tokenDetails ? (
                        <>
                            <SectionTitle>{sdkTypeName} API Key</SectionTitle>
                            <SectionSubtitle>
                                Here is your generated{' '}
                                {sdkTypeName.toLowerCase()} API key. We will use
                                it to connect to the{' '}
                                <b>{tokenDetails.project}</b> project in the{' '}
                                <b>{tokenDetails.environment}</b> environment.
                            </SectionSubtitle>
                        </>
                    ) : (
                        <SectionTitle>
                            Then generate a {sdkTypeName} API Key
                        </SectionTitle>
                    )}
                </SectionHeader>
                {tokenDetails ? (
                    <TokenExplanation
                        project={tokenDetails.project}
                        environment={tokenDetails.environment}
                        secret={tokenDetails.secret}
                    />
                ) : (
                    <Button
                        variant='contained'
                        disabled={loading}
                        onClick={generateAPIKey}
                    >
                        Generate {sdkTypeName} API Key
                    </Button>
                )}
            </SectionBox>
            {tokenDetails && (
                <ActionRow>
                    <Button variant='contained' onClick={onNext}>
                        Next
                    </Button>
                </ActionRow>
            )}
        </SpacedContainer>
    );
};
