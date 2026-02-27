import { Button, Divider, Typography, styled } from '@mui/material';
import demoQR from 'assets/img/demo-qr.svg';
import { formatAssetPath } from 'utils/formatPath';
import Launch from '@mui/icons-material/Launch';
import { DemoDialog } from '../DemoDialog.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useUiFlag } from 'hooks/useUiFlag.ts';

const StyledDemoPane = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: theme.palette.neutral.light,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2),
    margin: theme.spacing(2, 0),
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
    margin: theme.spacing(2, 0),
    padding: theme.spacing(0, 2),
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

const StyledButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing(4),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    flex: 1,
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
    const interactiveDemoKillSwitch = useUiFlag('interactiveDemoKillSwitch');
    const { trackEvent } = usePlausibleTracker();

    return (
        <DemoDialog open={open} onClose={onClose} preventCloseOnBackdropClick>
            <DemoDialog.Header>Explore Unleash</DemoDialog.Header>
            <Typography color='textSecondary' sx={{ mt: 2 }}>
                {interactiveDemoKillSwitch ? (
                    <>
                        You can explore Unleash on your own, or follow our{' '}
                        <StyledLink
                            href='https://docs.getunleash.io/guides/demo-walkthrough'
                            target='_blank'
                            rel='noreferrer'
                            onClick={() => {
                                trackEvent('demo-open-walkthrough-guide');
                            }}
                        >
                            demo walkthrough guide
                        </StyledLink>{' '}
                        alongside to get the most out of it. To get started, you
                        will need to open the demo website below.
                    </>
                ) : (
                    <>
                        You can explore Unleash on your own, however for the
                        best experience it's recommended you follow our
                        interactive demo. To get started, you will need to open
                        the demo website below.
                    </>
                )}
            </Typography>
            <StyledDemoPane>
                <StyledScanMessage>
                    Scan the QR code with your phone
                </StyledScanMessage>
                <StyledQRCode
                    src={formatAssetPath(demoQR)}
                    alt='Demo QR Code'
                />
                <StyledDivider>OR</StyledDivider>
                <Typography>
                    Open demo website in another tab:{' '}
                    <StyledLink
                        href='https://hello.unleash.run/?utm_source=Demo_instance&utm_medium=OpenLink&utm_campaign=Unleash'
                        target='_blank'
                        rel='noreferrer'
                        onClick={() => {
                            trackEvent('demo-open-demo-web');
                        }}
                    >
                        hello.unleash.run <Launch />
                    </StyledLink>
                </Typography>
                <Typography color='textSecondary'>
                    (we recommend you keep the pages open side by side)
                </Typography>
            </StyledDemoPane>
            {interactiveDemoKillSwitch && (
                <>
                    <Typography color='textSecondary' sx={{ mb: 1 }}>
                        The demo website can be controlled using the flags in
                        the demoApp project.
                    </Typography>
                    <Typography color='textSecondary' sx={{ mb: 2 }}>
                        Need guidance?{' '}
                        <StyledLink
                            href='https://docs.getunleash.io/guides/demo-walkthrough'
                            target='_blank'
                            rel='noreferrer'
                            onClick={() => {
                                trackEvent('demo-open-walkthrough-guide');
                            }}
                        >
                            Follow the demo walkthrough →
                        </StyledLink>
                    </Typography>
                </>
            )}
            <StyledButtons>
                {interactiveDemoKillSwitch ? (
                    <StyledButton
                        variant='contained'
                        color='primary'
                        onClick={onStart}
                    >
                        Explore Unleash
                    </StyledButton>
                ) : (
                    <>
                        <StyledButton
                            variant='outlined'
                            color='primary'
                            onClick={onClose}
                        >
                            Explore on your own
                        </StyledButton>
                        <StyledButton
                            variant='contained'
                            color='primary'
                            onClick={onStart}
                            data-testid='DEMO_START_BUTTON'
                        >
                            Go for a guided tour
                        </StyledButton>
                    </>
                )}
            </StyledButtons>
        </DemoDialog>
    );
};
