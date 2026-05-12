import { useEffect, useRef } from 'react';
import { Button, styled } from '@mui/material';
import { useProjectApiTokens } from 'hooks/api/getters/useProjectApiTokens/useProjectApiTokens';
import useProjectApiTokensApi from 'hooks/api/actions/useProjectApiTokensApi/useProjectApiTokensApi';
import useToast from 'hooks/useToast';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { formatUnknownError } from 'utils/formatUnknownError';
import { parseToken } from '../../parseToken';
import { ChooseEnvironment } from './ChooseEnvironment';
import { TokenExplanation } from './TokenExplanation';

const SectionHeader = styled('div')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body1.fontSize,
}));

const SectionDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    margin: 0,
}));

const SpacedContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(3, 0),
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
    alignSelf: 'stretch',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.elevation1,
}));

const SectionText = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const ActionRow = styled('div')({
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
});

export interface GenerateApiKeyStepContentProps {
    environments: string[];
    environment: string;
    onEnvSelect: (env: string) => void;
    parsedToken: ReturnType<typeof parseToken>;
    fetchingTokens?: boolean;
    creatingToken: boolean;
    generateAPIKey: () => void;
    onDone: () => void;
}

export const GenerateApiKeyStepContent = ({
    environments,
    environment,
    onEnvSelect,
    parsedToken,
    fetchingTokens = false,
    creatingToken,
    generateAPIKey,
    onDone,
}: GenerateApiKeyStepContentProps) => (
    <SpacedContainer>
        <SectionBox>
            <SectionText>
                <SectionHeader>First select environment</SectionHeader>
                <SectionDescription>
                    The environment connects to an SDK to retrieve information.
                </SectionDescription>
            </SectionText>
            {environments.length > 0 ? (
                <ChooseEnvironment
                    environments={environments}
                    environment={environment}
                    onSelect={onEnvSelect}
                />
            ) : null}
        </SectionBox>

        {parsedToken ? (
            <>
                <SectionBox>
                    <SectionText>
                        <SectionHeader>Then generate an API Key</SectionHeader>
                        <SectionDescription>
                            Here is your generated API key. We will use it to
                            connect to the <b>{parsedToken.project}</b> project
                            in the <b>{parsedToken.environment}</b> environment.
                        </SectionDescription>
                    </SectionText>
                    <TokenExplanation
                        project={parsedToken.project}
                        environment={parsedToken.environment}
                        secret={parsedToken.secret}
                    />
                </SectionBox>
                <ActionRow>
                    <Button variant='contained' onClick={onDone}>
                        Next
                    </Button>
                </ActionRow>
            </>
        ) : (
            <SectionBox>
                <SectionHeader>Then generate an API Key</SectionHeader>
                <Button
                    variant='contained'
                    disabled={fetchingTokens || creatingToken}
                    onClick={generateAPIKey}
                >
                    Generate API Key
                </Button>
            </SectionBox>
        )}
    </SpacedContainer>
);

export interface GenerateApiKeyStepProps {
    projectId: string;
    environments: string[];
    environment: string;
    onEnvSelect: (env: string) => void;
    sdkType: 'client' | 'frontend';
    onKeyGenerated: (apiKey: string | null) => void;
    onDone: () => void;
}

export const GenerateApiKeyStep = ({
    projectId,
    environments,
    environment,
    onEnvSelect,
    sdkType,
    onKeyGenerated,
    onDone,
}: GenerateApiKeyStepProps) => {
    const { trackEvent } = usePlausibleTracker();
    const {
        tokens,
        loading: fetchingTokens,
        refetch: refreshTokens,
    } = useProjectApiTokens(projectId);
    const { createToken, loading: creatingToken } = useProjectApiTokensApi();
    const { setToastApiError } = useToast();

    const currentToken = tokens.find(
        (token) => token.environment === environment && token.type === sdkType,
    );
    const parsedToken = parseToken(currentToken?.secret);

    const onKeyGeneratedRef = useRef(onKeyGenerated);
    onKeyGeneratedRef.current = onKeyGenerated;
    useEffect(() => {
        onKeyGeneratedRef.current(currentToken?.secret ?? null);
    }, [currentToken?.secret]);

    const generateAPIKey = async () => {
        try {
            await createToken(
                {
                    environment,
                    type: sdkType,
                    projects: [projectId],
                    tokenName: `api-key-${projectId}-${environment}`,
                },
                projectId,
            );
            refreshTokens();
            trackEvent('onboarding', {
                props: { eventType: 'api-key-generated' },
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <GenerateApiKeyStepContent
            environments={environments}
            environment={environment}
            onEnvSelect={onEnvSelect}
            parsedToken={parsedToken}
            fetchingTokens={fetchingTokens}
            creatingToken={creatingToken}
            generateAPIKey={generateAPIKey}
            onDone={onDone}
        />
    );
};
