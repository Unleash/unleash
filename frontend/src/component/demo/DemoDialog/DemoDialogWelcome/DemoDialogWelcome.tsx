import { Button, Divider, Typography, styled } from '@mui/material';
import demoQR from 'assets/img/demo-qr.png';
import { formatAssetPath } from 'utils/formatPath';
import { Launch } from '@mui/icons-material';
import { DemoDialog } from '../DemoDialog';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledDemoPane = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: theme.palette.neutral.light,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(4),
    margin: theme.spacing(4, 0),
}));

const StyledScanMessage = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(2),
}));

const StyledQRCode = styled('img')(({ theme }) => ({
    width: theme.spacing(20),
    height: theme.spacing(20),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: theme.spacing(4, 0),
    padding: theme.spacing(0, 4),
    width: '100%',
    color: theme.palette.text.secondary,
}));

const StyledLink = styled('a')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    '& > svg': {
        fontSize: theme.fontSizes.bodySize,
    },
}));

const StyledStartButton = styled(Button)(({ theme }) => ({
    height: theme.spacing(7),
}));

interface IDemoDialogWelcomeProps {
    open: boolean;
    onClose: () => void;
    onStart: () => void;
}

export const DemoDialogWelcome = ({
    open,
    onClose,
    onStart,
}: IDemoDialogWelcomeProps) => {
    const { trackEvent } = usePlausibleTracker();

    return (
        <DemoDialog open={open} onClose={onClose} preventCloseOnBackdropClick>
            <DemoDialog.Header>Explore Unleash</DemoDialog.Header>
            <Typography color="textSecondary" sx={{ mt: 2 }}>
                You can explore Unleash on your own, however for the best
                experience it's recommended you follow our interactive demo. To
                get started, you will need to open the demo website below.
            </Typography>
            <StyledDemoPane>
                <StyledScanMessage>
                    Scan the QR code with your phone
                </StyledScanMessage>
                <StyledQRCode
                    src={formatAssetPath(demoQR)}
                    alt="Demo QR Code"
                />
                <StyledDivider>OR</StyledDivider>
                <Typography>
                    Open demo website in another tab:{' '}
                    <StyledLink
                        href="https://hello.unleash.run/"
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                            trackEvent('demo-open-demo-web');
                        }}
                    >
                        hello.unleash.run <Launch />
                    </StyledLink>
                </Typography>
                <Typography color="textSecondary">
                    (we recommend you keep the pages open side by side)
                </Typography>
            </StyledDemoPane>
            <StyledStartButton
                variant="contained"
                color="primary"
                onClick={onStart}
                data-testid="DEMO_START_BUTTON"
            >
                Try Unleash demo
            </StyledStartButton>
        </DemoDialog>
    );
};
