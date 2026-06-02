import { useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    styled,
    Typography,
} from '@mui/material';
import type { SdkName } from 'component/onboarding/dialog/sharedTypes';
import useFeatureMetrics from 'hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import { useProjectSdkNamesFromFirstApplicationsPage } from 'hooks/api/getters/useProjectSdkNames/useProjectSdkNamesFromFirstApplicationsPage';
import { ImplementFlagInformation } from './ImplementFlagInformation.tsx';
import { FlagUsageSnippet } from './FlagUsageSnippet.tsx';
import { SelectSdk } from './SelectSdk.tsx';
import { DialogWithAside } from 'component/common/DialogWithAside/DialogWithAside';
import { SdkConnectionStatus } from 'component/onboarding/dialog/SdkEvaluationStatus';

const LoadingContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(8),
    flex: 1,
}));

const Body = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    flex: 1,
}));

const Footer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
}));

interface ImplementFlagDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    feature: string;
}

export const ImplementFlagDialog = ({
    open,
    onClose,
    projectId,
    feature,
}: ImplementFlagDialogProps) => (
    <DialogWithAside
        open={open}
        onClose={onClose}
        title='Use the flag in your code'
        aside={<ImplementFlagInformation />}
        maxWidth={135}
    >
        {open && (
            <DialogBody
                projectId={projectId}
                feature={feature}
                onClose={onClose}
            />
        )}
    </DialogWithAside>
);

interface DialogBodyProps {
    projectId: string;
    feature: string;
    onClose: () => void;
}

const DialogBody = ({ projectId, feature, onClose }: DialogBodyProps) => {
    const { sdkNames: projectSdkNames, loading: loadingProjectSdks } =
        useProjectSdkNamesFromFirstApplicationsPage(projectId);
    const defaultSdkName: SdkName = projectSdkNames[0] ?? 'Node.js';
    const [selectedSdkName, setSelectedSdkName] = useState<SdkName | undefined>(
        undefined,
    );
    const sdkName = selectedSdkName ?? defaultSdkName;

    const { metrics } = useFeatureMetrics(projectId, feature, {
        refreshInterval: 1000,
    });
    const evaluated = metrics.seenApplications.length > 0;

    return (
        <Body>
            {loadingProjectSdks ? (
                <LoadingContainer>
                    <CircularProgress />
                </LoadingContainer>
            ) : (
                <>
                    <SelectSdk value={sdkName} onChange={setSelectedSdkName} />

                    <Box>
                        <Typography
                            variant='body2'
                            sx={{
                                fontWeight: 'bold',
                                mb: 1,
                            }}
                        >
                            Code example
                        </Typography>
                        <FlagUsageSnippet sdkName={sdkName} feature={feature} />
                    </Box>

                    <Box>
                        <Typography
                            variant='body1'
                            sx={{
                                fontWeight: 'bold',
                                mb: 1,
                            }}
                        >
                            Test flag
                        </Typography>
                        <SdkConnectionStatus
                            sdkConnected={evaluated}
                            connectedTitle='Got the first evaluation!'
                            connectedBody='Your flag is wired up. Finish setup to close this dialog.'
                            waitingTitle='Listening for the first evaluation…'
                            waitingBody='Run your app and evaluate your flag.'
                        />
                    </Box>
                </>
            )}
            <Footer>
                <Button
                    variant='contained'
                    disabled={!evaluated}
                    onClick={onClose}
                >
                    Finish setup
                </Button>
            </Footer>
        </Body>
    );
};
