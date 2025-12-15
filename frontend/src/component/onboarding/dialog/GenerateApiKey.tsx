import { useProjectApiTokens } from 'hooks/api/getters/useProjectApiTokens/useProjectApiTokens';
import useProjectApiTokensApi from 'hooks/api/actions/useProjectApiTokensApi/useProjectApiTokensApi';
import { parseToken } from './parseToken.ts';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import {
    Box,
    Button,
    styled,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { SingleSelectConfigButton } from 'component/common/DialogFormTemplate/ConfigButtons/SingleSelectConfigButton';
import EnvironmentsIcon from '@mui/icons-material/CloudCircle';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { useEffect } from 'react';
import { SectionHeader, StepperBox } from './SharedComponents.tsx';
import { Stepper } from './Stepper.tsx';
import { Badge } from 'component/common/Badge/Badge';
import { usePlausibleTracker } from '../../../hooks/usePlausibleTracker.ts';

const ChooseEnvironment = ({
    environments,
    onSelect,
    currentEnvironment,
}: {
    environments: string[];
    currentEnvironment: string;
    onSelect: (env: string) => void;
}) => {
    const longestEnv = Math.max(
        ...environments.map((environment) => environment.length),
    );

    return (
        <SingleSelectConfigButton
            tooltip={{ header: '' }}
            description='Select the environment where the API key will be created'
            options={environments.map((environment) => ({
                label: environment,
                value: environment,
            }))}
            onChange={(value: any) => {
                onSelect(value);
            }}
            button={{
                label: currentEnvironment,
                icon: <EnvironmentsIcon />,
                labelWidth: `${longestEnv + 5}ch`,
            }}
            search={{
                label: 'Filter project mode options',
                placeholder: 'Select project mode',
            }}
        />
    );
};

const SecretExplanation = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const SecretExplanationDescription = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    flex: 1,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

const TokenExplanationBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
    marginTop: theme.spacing(8),
    flexWrap: 'wrap',
}));

const SectionDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing(2),
}));

const SpacedContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(5, 8, 3, 8),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const TokenExplanation = ({
    project,
    environment,
    secret,
}: {
    project: string;
    environment: string;
    secret: string;
}) => {
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

    return (
        <ArcherContainer
            strokeColor={theme.palette.secondary.border}
            endMarker={false}
            lineStyle='curve'
        >
            <SecretExplanation>
                <Box sx={{ wordBreak: 'break-all' }}>
                    <ArcherElement id='project'>
                        <span>{project}</span>
                    </ArcherElement>
                    :
                    <ArcherElement id='environment'>
                        <span>{environment}</span>
                    </ArcherElement>
                    .
                    <ArcherElement id='secret'>
                        <span>{secret}</span>
                    </ArcherElement>
                </Box>

                {isLargeScreen ? (
                    <TokenExplanationBox>
                        <ArcherElement
                            id='project-description'
                            relations={[
                                {
                                    targetId: 'project',
                                    targetAnchor: 'bottom',
                                    sourceAnchor: 'top',
                                },
                            ]}
                        >
                            <SecretExplanationDescription>
                                The project this API key can retrieve feature
                                flags from
                            </SecretExplanationDescription>
                        </ArcherElement>
                        <ArcherElement
                            id='environment-description'
                            relations={[
                                {
                                    targetId: 'environment',
                                    targetAnchor: 'bottom',
                                    sourceAnchor: 'top',
                                },
                            ]}
                        >
                            <SecretExplanationDescription>
                                The environment this API key can retrieve
                                feature flag configuration from
                            </SecretExplanationDescription>
                        </ArcherElement>
                        <ArcherElement
                            id='secret-description'
                            relations={[
                                {
                                    targetId: 'secret',
                                    targetAnchor: 'right',
                                    sourceAnchor: 'top',
                                },
                            ]}
                        >
                            <SecretExplanationDescription>
                                The API key secret
                            </SecretExplanationDescription>
                        </ArcherElement>
                    </TokenExplanationBox>
                ) : null}
            </SecretExplanation>
        </ArcherContainer>
    );
};

interface GenerateApiKeyProps {
    project: string;
    environments: string[];
    environment: string;
    sdkType: 'client' | 'frontend';
    onEnvSelect: (env: string) => void;
    onApiKey: (apiKey: string | null) => void;
}

export const GenerateApiKey = ({
    environments,
    environment,
    project,
    sdkType,
    onEnvSelect,
    onApiKey,
}: GenerateApiKeyProps) => {
    const { trackEvent } = usePlausibleTracker();
    const { tokens, refetch: refreshTokens } = useProjectApiTokens(project);
    const { createToken, loading: creatingToken } = useProjectApiTokensApi();
    const currentEnvironmentToken = tokens.find(
        (token) => token.environment === environment && token.type === sdkType,
    );

    useEffect(() => {
        onApiKey(currentEnvironmentToken?.secret || null);
    }, [currentEnvironmentToken]);

    const parsedToken = parseToken(currentEnvironmentToken?.secret);

    const { setToastApiError } = useToast();

    const generateAPIKey = async () => {
        try {
            await createToken(
                {
                    environment,
                    type: sdkType,
                    projects: [project],
                    tokenName: `api-key-${project}-${environment}`,
                },
                project,
            );
            refreshTokens();
            trackGenerate();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const trackGenerate = () => {
        trackEvent('onboarding', {
            props: {
                eventType: 'api-key-generated',
            },
        });
    };

    return (
        <SpacedContainer>
            <Typography variant='h2'>Connect an SDK to Unleash</Typography>
            <StepperBox>
                <Stepper active={1} steps={3} />
                <Badge color='secondary'>2/3 - Generate API Key</Badge>
            </StepperBox>
            <Box sx={{ mt: 2 }}>
                <SectionHeader>Environment</SectionHeader>
                <SectionDescription>
                    The environment the SDK connects to to retrieve
                    configuration.
                </SectionDescription>
                {environments.length > 0 ? (
                    <ChooseEnvironment
                        environments={environments}
                        currentEnvironment={environment}
                        onSelect={onEnvSelect}
                    />
                ) : null}
            </Box>

            <Box sx={{ mt: 3 }}>
                <SectionHeader>API Key</SectionHeader>
                {parsedToken ? (
                    <SectionDescription>
                        Here is your generated API key. We will use it to
                        connect to the <b>{parsedToken.project}</b> project in
                        the <b>{parsedToken.environment}</b> environment.
                    </SectionDescription>
                ) : (
                    <SectionDescription>
                        You currently have no active API keys for this
                        project/environment combination. Generate an API key to
                        proceed with connecting your SDK.
                    </SectionDescription>
                )}
                {parsedToken ? (
                    <TokenExplanation
                        project={parsedToken.project}
                        environment={parsedToken.environment}
                        secret={parsedToken.secret}
                    />
                ) : (
                    <Button
                        variant='contained'
                        disabled={creatingToken}
                        onClick={generateAPIKey}
                    >
                        Generate API Key
                    </Button>
                )}
            </Box>
        </SpacedContainer>
    );
};
