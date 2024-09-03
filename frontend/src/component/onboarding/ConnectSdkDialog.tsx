import {
    Box,
    Button,
    Dialog,
    styled,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { GenrateApiKeyConcepts, GenerateApiKey } from './GenerateApiKey';
import { useState } from 'react';
import { SelectSdk } from './SelectSdk';

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
    marginTop: 'auto',
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
    | { name: 'generate-api-key'; sdkType: 'CLIENT' | 'FRONTEND' }
    | { name: 'test-connection' };

export const ConnectSdkDialog = ({
    open,
    onClose,
    environments,
    project,
}: IConnectSDKDialogProps) => {
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    const [stage, setStage] = useState<OnboardingStage>({ name: 'select-sdk' });

    return (
        <StyledDialog open={open} onClose={onClose}>
            <Box sx={{ display: 'flex' }}>
                <ConnectSdk>
                    {stage.name === 'select-sdk' ? <SelectSdk /> : null}
                    {stage.name === 'generate-api-key' ? (
                        <GenerateApiKey
                            environments={environments}
                            project={project}
                            sdkType={stage.sdkType}
                        />
                    ) : null}

                    {stage.name === 'generate-api-key' ? (
                        <Navigation>
                            <NextStepSectionSpacedContainer>
                                <Button variant='text' color='inherit'>
                                    Back
                                </Button>
                                <Button variant='contained'>Next</Button>
                            </NextStepSectionSpacedContainer>
                        </Navigation>
                    ) : null}
                </ConnectSdk>

                {isLargeScreen ? <GenrateApiKeyConcepts /> : null}
            </Box>
        </StyledDialog>
    );
};
