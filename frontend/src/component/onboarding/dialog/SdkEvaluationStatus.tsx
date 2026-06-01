import { Alert, alpha, styled, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { PulsingAvatar } from 'component/common/PulsingAvatar/PulsingAvatar.tsx';

// --- ListeningStatus (used by ImplementFlagDialog) ---

const ListeningCard = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.secondary.border}`,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
}));

const ListeningIcon = styled('div')(({ theme }) => ({
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    gap: 3,
    '@keyframes bubble': {
        '0%, 80%, 100%': {
            transform: 'scale(0.4)',
            opacity: 0.5,
        },
        '40%': {
            transform: 'scale(1)',
            opacity: 1,
        },
    },
    '& span': {
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: theme.palette.primary.contrastText,
        animation: 'bubble 1.4s infinite ease-in-out both',
    },
    '& span:nth-of-type(1)': {
        animationDelay: '-0.32s',
    },
    '& span:nth-of-type(2)': {
        animationDelay: '-0.16s',
    },
}));

const ListeningText = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

export const ListeningStatus = ({ evaluated }: { evaluated: boolean }) => (
    <ListeningCard>
        <ListeningIcon>
            {evaluated ? (
                <CheckIcon />
            ) : (
                <>
                    <span />
                    <span />
                    <span />
                </>
            )}
        </ListeningIcon>
        <ListeningText>
            <Typography
                variant='body2'
                color='primary'
                sx={{ fontWeight: 'bold' }}
            >
                {evaluated
                    ? 'Got the first evaluation!'
                    : 'Listening for the first evaluation…'}
            </Typography>
            <Typography variant='caption' color='primary'>
                {evaluated
                    ? 'Your flag is wired up. Finish setup to close this dialog.'
                    : 'Render the code path above anywhere to check that we receive metric evaluations.'}
            </Typography>
        </ListeningText>
    </ListeningCard>
);

// --- SdkConnectionStatus (used by ConfigureSdk) ---

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

const ConnectionPulsingAvatar = styled(PulsingAvatar)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: theme.spacing(3),
    height: theme.spacing(3),
    '@keyframes pulse': {
        '0%': {
            boxShadow: `0 0 0 0px ${alpha(theme.palette.primary.main, 0.4)}`,
        },
        '100%': {
            boxShadow: `0 0 0 16px ${alpha(theme.palette.primary.main, 0.0)}`,
        },
    },
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

interface SdkConnectionStatusProps {
    sdkConnected: boolean;
    showTroubleshooting?: boolean;
}

export const SdkConnectionStatus = ({
    sdkConnected,
    showTroubleshooting = false,
}: SdkConnectionStatusProps) => {
    if (sdkConnected) {
        return (
            <ConnectedAlert>
                <div>
                    <ConnectedIcon />
                </div>
                <div>
                    <strong>We received metrics from your application</strong>
                    <Typography variant='body2' color='textSecondary'>
                        Your SDK is connected and evaluating flags.
                    </Typography>
                </div>
            </ConnectedAlert>
        );
    }

    return (
        <ConnectionAlert>
            <div>
                <ConnectionPulsingAvatar active>
                    <MoreHorizIcon />
                </ConnectionPulsingAvatar>
            </div>
            <div>
                <strong>Waiting for SDK data...</strong>
                <Typography variant='body2' color='textSecondary'>
                    Run your app and evaluate your flag. This step completes on
                    its own.
                </Typography>
                {showTroubleshooting && (
                    <TroubleshootingAlert severity='warning'>
                        Not seeing evaluations after ~30s? Make sure your app
                        has started and that the client was initialized with the
                        API key from step 2.
                    </TroubleshootingAlert>
                )}
            </div>
        </ConnectionAlert>
    );
};
