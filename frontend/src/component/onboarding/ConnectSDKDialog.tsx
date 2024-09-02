import {
    Box,
    Button,
    Dialog,
    styled,
    type Theme,
    Typography,
} from '@mui/material';
import { SingleSelectConfigButton } from '../common/DialogFormTemplate/ConfigButtons/SingleSelectConfigButton';
import EnvironmentsIcon from '@mui/icons-material/CloudCircle';
import { useEffect, useState } from 'react';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import CodeIcon from '@mui/icons-material/Code';

interface IConnectSDKDialogProps {
    open: boolean;
    onClose: () => void;
    project: string;
    environments: string[];
}

const ConceptsDefinitions = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.sidebar,
    padding: theme.spacing(8),
    flexBasis: '30%',
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
    flexBasis: '70%',
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

export const ConnectSDKDialog = ({
    open,
    onClose,
    environments,
}: IConnectSDKDialogProps) => {
    const [environment, setEnvironment] = useState('');
    const longestEnv = Math.max(
        ...environments.map((environment) => environment.length),
    );

    useEffect(() => {
        if (environments.length > 0) {
            setEnvironment(environments[0]);
        }
    }, [JSON.stringify(environments)]);

    return (
        <StyledDialog open={open} onClose={onClose}>
            <Box sx={{ display: 'flex' }}>
                <APIKeyGeneration>
                    <SpacedContainer>
                        <Typography variant='h2'>
                            Connect an SDK to Unleash
                        </Typography>
                        <Box>
                            <SectionHeader>Environment</SectionHeader>
                            <SectionDescription>
                                The environment SDK will connect to in order to
                                retrieve configuration.
                            </SectionDescription>
                            {environments.length > 0 ? (
                                <SingleSelectConfigButton
                                    tooltip={{ header: '' }}
                                    description='Select the environment where API key will be created'
                                    options={environments.map(
                                        (environment) => ({
                                            label: environment,
                                            value: environment,
                                        }),
                                    )}
                                    onChange={(value: any) => {
                                        setEnvironment(value);
                                    }}
                                    button={{
                                        label: environment,
                                        icon: <EnvironmentsIcon />,
                                        labelWidth: `${longestEnv + 5}ch`,
                                    }}
                                    search={{
                                        label: 'Filter project mode options',
                                        placeholder: 'Select project mode',
                                    }}
                                />
                            ) : null}
                        </Box>

                        <Box sx={{ mt: 3 }}>
                            <SectionHeader>API Key</SectionHeader>
                            <SectionDescription>
                                You currently have no active API keys for this
                                project/environment combination. You'll need to
                                generate and API key in order to proceed with
                                connecting your SDK.
                            </SectionDescription>
                            <Button variant='contained'>
                                Generate API Key
                            </Button>
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
                <ConceptsDefinitions>
                    <ConceptItem>
                        <StyledProjectIcon />
                        <Box>
                            <ConceptSummary>
                                Flags live in projects
                            </ConceptSummary>
                            <ConceptDetails>
                                Projects are containers for feature flags. When
                                you create a feature flag it will belong to the
                                project you create it in.
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
                                In Unleash you can have multiple environments.
                                Each feature flag will have different
                                configuration in every environment.
                            </ConceptDetails>
                        </Box>
                    </ConceptItem>
                    <ConceptItem>
                        <StyledCodeIcon />
                        <Box>
                            <ConceptSummary>
                                SDKs connect to Unleash to retrieve
                                configuration
                            </ConceptSummary>
                            <ConceptDetails>
                                When you connect an SDK to Unleash it will use
                                the API key to deduce which feature flags to
                                retrieve and from which environment to retrieve
                                configuration.
                            </ConceptDetails>
                        </Box>
                    </ConceptItem>
                </ConceptsDefinitions>
            </Box>
        </StyledDialog>
    );
};
