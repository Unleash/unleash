import {
    Box,
    Button,
    Dialog,
    styled,
    type Theme,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { SingleSelectConfigButton } from '../common/DialogFormTemplate/ConfigButtons/SingleSelectConfigButton';
import EnvironmentsIcon from '@mui/icons-material/CloudCircle';
import { useEffect, useState } from 'react';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import CodeIcon from '@mui/icons-material/Code';
import { useProjectApiTokens } from 'hooks/api/getters/useProjectApiTokens/useProjectApiTokens';
import { ArcherContainer, ArcherElement } from 'react-archer';
import useProjectApiTokensApi from 'hooks/api/actions/useProjectApiTokensApi/useProjectApiTokensApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { parseToken } from './parseToken';

interface IConnectSDKDialogProps {
    open: boolean;
    onClose: () => void;
    project: string;
    environments: string[];
}

const ConceptsDefinitionsWrapper = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.sidebar,
    padding: theme.spacing(6),
    flex: 0,
    minWidth: '400px',
}));

const IconStyle = ({ theme }: { theme: Theme }) => ({
    color: theme.palette.primary.contrastText,
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(0.5),
});

const StyledProjectIcon = styled(ProjectIcon)(IconStyle);
const StyledEnvironmentsIcon = styled(EnvironmentsIcon)(IconStyle);
const StyledCodeIcon = styled(CodeIcon)(IconStyle);

const ConceptItem = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'flex-start',
    marginTop: theme.spacing(3),
}));

const ConceptSummary = styled('div')(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(2),
}));

const ConceptDetails = styled('p')(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    fontSize: theme.fontSizes.smallerBody,
    marginBottom: theme.spacing(2),
}));

export const APIKeyGeneration = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
}));

export const SpacedContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(5, 8, 3, 8),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(170),
        width: '100%',
        backgroundColor: 'transparent',
    },
    padding: 0,
    '& .MuiPaper-root > section': {
        overflowX: 'hidden',
    },
}));

const SectionHeader = styled('div')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(1),
    fontSize: theme.fontSizes.bodySize,
}));

const SectionDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginBottom: theme.spacing(2),
}));

const NextStepSection = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    borderTop: `1px solid ${theme.palette.divider}}`,
}));

const NextStepSectionSpacedContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(3, 8, 3, 8),
}));

const SecretExplanation = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const SecretExplanationDescription = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.primary.contrastText,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    flex: 1,
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

const ConceptsDefinitions = () => (
    <ConceptsDefinitionsWrapper>
        <ConceptItem>
            <StyledProjectIcon />
            <Box>
                <ConceptSummary>Flags live in projects</ConceptSummary>
                <ConceptDetails>
                    Projects are containers for feature flags. When you create a
                    feature flag it will belong to the project you create it in.
                </ConceptDetails>
            </Box>
        </ConceptItem>
        <ConceptItem>
            <StyledEnvironmentsIcon />
            <Box>
                <ConceptSummary>
                    Flags have configuration in environments
                </ConceptSummary>
                <ConceptDetails>
                    In Unleash you can have multiple environments. Each feature
                    flag will have different configuration in every environment.
                </ConceptDetails>
            </Box>
        </ConceptItem>
        <ConceptItem>
            <StyledCodeIcon />
            <Box>
                <ConceptSummary>
                    SDKs connect to Unleash to retrieve configuration
                </ConceptSummary>
                <ConceptDetails>
                    When you connect an SDK to Unleash it will use the API key
                    to deduce which feature flags to retrieve and from which
                    environment to retrieve configuration.
                </ConceptDetails>
            </Box>
        </ConceptItem>
    </ConceptsDefinitionsWrapper>
);

const TokenExplanationBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
    marginTop: theme.spacing(8),
    flexWrap: 'wrap',
}));

const TokenExplanation = ({
    project,
    environment,
    secret,
}: { project: string; environment: string; secret: string }) => {
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
                                The project this API key will retrieve feature
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
                                The environment the API key will retrieve
                                feature flag configuration from
                            </SecretExplanationDescription>
                        </ArcherElement>
                        <ArcherElement
                            id='secreat-description'
                            relations={[
                                {
                                    targetId: 'secret',
                                    targetAnchor: 'bottom',
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
            description='Select the environment where API key will be created'
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

export const ConnectSDKDialog = ({
    open,
    onClose,
    environments,
    project,
}: IConnectSDKDialogProps) => {
    const [environment, setEnvironment] = useState('');

    useEffect(() => {
        if (environments.length > 0) {
            setEnvironment(environments[0]);
        }
    }, [JSON.stringify(environments)]);

    const { tokens, refetch: refreshTokens } = useProjectApiTokens(project);
    const { createToken, loading: creatingToken } = useProjectApiTokensApi();
    const currentEnvironmentToken = tokens.find(
        (token) => token.environment === environment,
    );
    const parsedToken = parseToken(currentEnvironmentToken?.secret);

    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    const { setToastApiError } = useToast();

    const generateAPIKey = async () => {
        try {
            await createToken(
                {
                    environment,
                    type: 'CLIENT',
                    projects: [project],
                    username: 'onboarding-api-key',
                },
                project,
            );
            refreshTokens();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose}>
            <Box sx={{ display: 'flex' }}>
                <APIKeyGeneration>
                    <SpacedContainer>
                        <Typography variant='h2'>
                            Connect an SDK to Unleash
                        </Typography>
                        <Box sx={{ mt: 4 }}>
                            <SectionHeader>Environment</SectionHeader>
                            <SectionDescription>
                                The environment SDK will connect to in order to
                                retrieve configuration.
                            </SectionDescription>
                            {environments.length > 0 ? (
                                <ChooseEnvironment
                                    environments={environments}
                                    currentEnvironment={environment}
                                    onSelect={setEnvironment}
                                />
                            ) : null}
                        </Box>

                        <Box sx={{ mt: 3 }}>
                            <SectionHeader>API Key</SectionHeader>
                            {parsedToken ? (
                                <SectionDescription>
                                    Here is your generated API key. We will use
                                    it to connect to the{' '}
                                    <b>{parsedToken.project}</b> project in the{' '}
                                    <b>{parsedToken.environment}</b>{' '}
                                    environment.
                                </SectionDescription>
                            ) : (
                                <SectionDescription>
                                    You currently have no active API keys for
                                    this project/environment combination. You'll
                                    need to generate and API key in order to
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

                    <NextStepSection>
                        <NextStepSectionSpacedContainer>
                            <Box>
                                <b>Next:</b> Choose SDK and connect
                            </Box>
                            <Button variant='contained'>Next</Button>
                        </NextStepSectionSpacedContainer>
                    </NextStepSection>
                </APIKeyGeneration>

                {isLargeScreen ? <ConceptsDefinitions /> : null}
            </Box>
        </StyledDialog>
    );
};
