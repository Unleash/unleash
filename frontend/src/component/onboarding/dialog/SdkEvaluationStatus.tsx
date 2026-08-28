import { Alert, styled, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ConnectionPulse } from 'component/common/ConnectionPulse/ConnectionPulse.tsx';

const ConnectionAlert = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    fontSize: theme.typography.body2.fontSize,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.secondary.border}`,
}));

const ConnectedAlert = styled(ConnectionAlert)(({ theme }) => ({
    backgroundColor: theme.palette.success.light,
    border: `1px solid ${theme.palette.success.border}`,
}));

const StyledPulse = styled('div')(({ theme }) => ({
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
}));

const ConnectedIcon = styled(CheckCircleIcon)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: theme.spacing(3),
    height: theme.spacing(3),
    color: theme.palette.success.main,
}));

const TroubleshootingAlert = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(2),
    padding: theme.spacing(2, 3),
    '& .MuiAlert-message': {
        padding: 0,
    },
    '& .MuiAlert-icon': {
        marginRight: theme.spacing(1),
    },
}));

export type TroubleshootingProps =
    | { showTroubleshooting: boolean; troubleshootingText: string }
    | { showTroubleshooting?: never; troubleshootingText?: never };

type SdkConnectionStatusProps = {
    sdkConnected: boolean;
    connectedTitle: string;
    connectedBody: string;
    waitingTitle: string;
    waitingBody: string;
} & TroubleshootingProps;

export const SdkConnectionStatus = ({
    sdkConnected,
    connectedTitle,
    connectedBody,
    waitingTitle,
    waitingBody,
    showTroubleshooting,
    troubleshootingText,
}: SdkConnectionStatusProps) => {
    if (sdkConnected) {
        return (
            <ConnectedAlert>
                <div>
                    <ConnectedIcon />
                </div>
                <div>
                    <strong>{connectedTitle}</strong>
                    <Typography variant='body2' color='textSecondary'>
                        {connectedBody}
                    </Typography>
                </div>
            </ConnectedAlert>
        );
    }

    return (
        <ConnectionAlert>
            <StyledPulse>
                <ConnectionPulse />
            </StyledPulse>
            <div>
                <strong>{waitingTitle}</strong>
                <Typography variant='body2' color='textSecondary'>
                    {waitingBody}
                </Typography>
                {showTroubleshooting && (
                    <TroubleshootingAlert severity='warning'>
                        {troubleshootingText}
                    </TroubleshootingAlert>
                )}
            </div>
        </ConnectionAlert>
    );
};
