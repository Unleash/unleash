import {
    Box,
    Button,
    Dialog,
    styled,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { GenerateApiKey } from './GenerateApiKey.tsx';
import { useEffect, useState } from 'react';
import { SelectSdk } from './SelectSdk.tsx';
import {
    GenerateApiKeyConcepts,
    SelectSdkConcepts,
} from './UnleashConcepts.tsx';

import type { Sdk } from './sharedTypes.ts';
import { ConnectionInformation } from './ConnectionInformation.tsx';
import { SdkConnection } from './SdkConnection.tsx';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';

interface IConnectSDKDialogProps {
    open: boolean;
    onClose: () => void;
    onFinish: (sdkName: string) => void;
    project: string;
    environments: string[];
    feature?: string;
}

const ConnectSdk = styled('main')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
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

const Navigation = styled('div')(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(4),
    alignItems: 'center',
    padding: theme.spacing(3, 8, 3, 8),
}));

const NextStepSectionSpacedContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(4),
    alignItems: 'center',
    padding: theme.spacing(3, 8, 3, 8),
}));

type OnboardingStage = 'select-sdk' | 'generate-api-key' | 'test-connection';

const InnerDialog = ({
    onClose,
    onFinish,
    environments,
    project: projectId,
    feature,
}: Omit<IConnectSDKDialogProps, 'open'>) => {
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    const [sdk, setSdk] = useState<Sdk | null>(null);
    const [environment, setEnvironment] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [stage, setStage] = useState<OnboardingStage>('select-sdk');

    const { project } = useProjectOverview(projectId, {
        refreshInterval: 1000,
    });

    const isSelectSdkStage = stage === 'select-sdk';
    const isGenerateApiKeyStage =
        stage === 'generate-api-key' && sdk && environment;
    const isTestConnectionStage =
        stage === 'test-connection' && sdk && environment && apiKey;

    const onboarded = project.onboardingStatus.status === 'onboarded';

    useEffect(() => {
        if (environments.length > 0) {
            setEnvironment(environments[0]);
        }
    }, [JSON.stringify(environments)]);

    return (
        <StyledDialog open={true} onClose={onClose}>
            <Box sx={{ display: 'flex' }}>
                <ConnectSdk>
                    {isSelectSdkStage ? (
                        <SelectSdk
                            onSelect={(sdk) => {
                                setSdk(sdk);
                                setStage('generate-api-key');
                            }}
                        />
                    ) : null}
                    {isGenerateApiKeyStage ? (
                        <GenerateApiKey
                            environments={environments}
                            environment={environment}
                            project={projectId}
                            sdkType={sdk.type}
                            onEnvSelect={setEnvironment}
                            onApiKey={setApiKey}
                        />
                    ) : null}
                    {isTestConnectionStage ? (
                        <SdkConnection
                            apiKey={apiKey}
                            sdk={sdk}
                            feature={feature}
                            onSdkChange={() => {
                                setStage('select-sdk');
                            }}
                        />
                    ) : null}

                    {stage === 'generate-api-key' ? (
                        <Navigation>
                            <NextStepSectionSpacedContainer>
                                <Button
                                    variant='text'
                                    color='inherit'
                                    onClick={() => {
                                        setStage('select-sdk');
                                    }}
                                >
                                    Back
                                </Button>
                                <Button
                                    variant='contained'
                                    disabled={!apiKey}
                                    onClick={() => {
                                        setStage('test-connection');
                                    }}
                                >
                                    Next
                                </Button>
                            </NextStepSectionSpacedContainer>
                        </Navigation>
                    ) : null}
                    {isTestConnectionStage ? (
                        <Navigation>
                            <NextStepSectionSpacedContainer>
                                {!onboarded ? (
                                    <Button
                                        variant='text'
                                        color='inherit'
                                        onClick={() => {
                                            setStage('generate-api-key');
                                        }}
                                    >
                                        Back
                                    </Button>
                                ) : null}

                                <Button
                                    variant='contained'
                                    onClick={() => {
                                        onFinish(sdk.name);
                                    }}
                                >
                                    Complete
                                </Button>
                            </NextStepSectionSpacedContainer>
                        </Navigation>
                    ) : null}
                </ConnectSdk>

                {isLargeScreen && isSelectSdkStage ? (
                    <SelectSdkConcepts />
                ) : null}
                {isLargeScreen && isGenerateApiKeyStage ? (
                    <GenerateApiKeyConcepts />
                ) : null}
                {isLargeScreen && isTestConnectionStage ? (
                    <ConnectionInformation
                        projectId={projectId}
                        sdk={sdk.name}
                        environment={environment}
                    />
                ) : null}
            </Box>
        </StyledDialog>
    );
};

export const ConnectSdkDialog = ({
    open,
    ...props
}: IConnectSDKDialogProps) => {
    return open ? <InnerDialog {...props} /> : null;
};
