import {
    Box,
    Button,
    Dialog,
    styled,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { GenerateApiKey } from './GenerateApiKey';
import { useEffect, useState } from 'react';
import { type Sdk, SelectSdk } from './SelectSdk';
import { GenrateApiKeyConcepts, SelectSdkConcepts } from './UnleashConcepts';

interface IConnectSDKDialogProps {
    open: boolean;
    onClose: () => void;
    project: string;
    environments: string[];
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
    marginTop: theme.spacing(16),
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

type OnboardingStage =
    | { name: 'select-sdk' }
    | { name: 'generate-api-key' }
    | { name: 'test-connection' };

export const ConnectSdkDialog = ({
    open,
    onClose,
    environments,
    project,
}: IConnectSDKDialogProps) => {
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    const [sdk, setSdk] = useState<Sdk | null>(null);
    const [environment, setEnvironment] = useState<string | null>(null);
    const [stage, setStage] = useState<OnboardingStage>({ name: 'select-sdk' });

    useEffect(() => {
        if (environments.length > 0) {
            setEnvironment(environments[0]);
        }
    }, [JSON.stringify(environments)]);

    return (
        <StyledDialog open={open} onClose={onClose}>
            <Box sx={{ display: 'flex' }}>
                <ConnectSdk>
                    {stage.name === 'select-sdk' ? (
                        <SelectSdk
                            onSelect={(sdk) => {
                                setSdk(sdk);
                                setStage({ name: 'generate-api-key' });
                            }}
                        />
                    ) : null}
                    {stage.name === 'generate-api-key' && sdk && environment ? (
                        <GenerateApiKey
                            environments={environments}
                            environment={environment}
                            project={project}
                            sdkType={sdk.type}
                            onEnvSelect={setEnvironment}
                        />
                    ) : null}

                    {stage.name === 'generate-api-key' ? (
                        <Navigation>
                            <NextStepSectionSpacedContainer>
                                <Button
                                    variant='text'
                                    color='inherit'
                                    onClick={() => {
                                        setStage({ name: 'select-sdk' });
                                    }}
                                >
                                    Back
                                </Button>
                                <Button variant='contained'>Next</Button>
                            </NextStepSectionSpacedContainer>
                        </Navigation>
                    ) : null}
                </ConnectSdk>

                {isLargeScreen && stage.name === 'select-sdk' ? (
                    <SelectSdkConcepts />
                ) : null}
                {isLargeScreen && stage.name === 'generate-api-key' ? (
                    <GenrateApiKeyConcepts />
                ) : null}
            </Box>
        </StyledDialog>
    );
};
