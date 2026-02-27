import { formatApiPath } from 'utils/formatPath';
import { Dialogue } from '../Dialogue/Dialogue';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useContext, useEffect } from 'react';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import { Alert, styled, Typography } from '@mui/material';
import { ReactComponent as LenovoLogo } from 'assets/logos/lenovo.svg';
import { ReactComponent as DockerLogo } from 'assets/logos/docker.svg';
import { ReactComponent as VisaLogo } from 'assets/logos/visa.svg';
import { ReactComponent as SamsungLogo } from 'assets/logos/samsung.svg';
import { ReactComponent as LloydsLogo } from 'assets/logos/lloyds.svg';
import { useInstancePrices } from 'hooks/api/getters/useInstancePrices/useInstancePrices';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { trialHasExpired } from 'utils/instanceTrial';

const StyledBillingInformation = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(1.5, 3, 2.5, 3),
    border: `1px solid ${theme.palette.secondary.border}`,
    backgroundColor: theme.palette.secondary.light,
}));

const StyledPrice = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.fontSizes.largeHeader,
}));

const StyledDetailList = styled('ul')(({ theme }) => ({
    display: 'flex',
    margin: 0,
    padding: 0,
    marginLeft: theme.spacing(2.5),
    marginTop: theme.spacing(1),
    gap: theme.spacing(3.5),
}));

const StyledLogoList = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(0.75),
    padding: theme.spacing(0, 0.25),
    gap: theme.spacing(2),
    color: theme.palette.text.secondary,
}));

interface IUpgradeTrialDialogProps {
    dialogOpen: boolean;
    setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UpgradeTrialDialog = ({
    dialogOpen,
    setDialogOpen,
}: IUpgradeTrialDialogProps) => {
    const { instanceStatus } = useInstanceStatus();
    const { hasAccess } = useContext(AccessContext);
    const { trackEvent } = usePlausibleTracker();
    const { instancePrices } = useInstancePrices();

    const isAdmin = hasAccess(ADMIN);

    const seatPrice = instancePrices.payg.seat;

    useEffect(() => {
        if (dialogOpen) {
            trackEvent('upgrade_trial_dialog', {
                props: {
                    eventType: 'open',
                    userType: isAdmin ? 'admin' : 'non-admin',
                },
            });
        }
    }, [dialogOpen]);

    const onClickUpgrade = () => {
        trackEvent('upgrade_trial_dialog', {
            props: {
                eventType: 'upgrade_click',
                userType: isAdmin ? 'admin' : 'non-admin',
            },
        });
        window.location.assign(formatApiPath('api/admin/invoices/checkout'));
        setDialogOpen(false);
    };

    const onClose = () => {
        trackEvent('upgrade_trial_dialog', {
            props: {
                eventType: 'close',
                userType: isAdmin ? 'admin' : 'non-admin',
            },
        });
        setDialogOpen(false);
    };

    const text = trialHasExpired(instanceStatus)
        ? 'Your free trial has expired and your account is scheduled for deletion. Upgrade to preserve your projects and feature flags.'
        : 'Upgrade now to unlock all features and keep your projects and feature flags after your trial ends.';

    return (
        <Dialogue
            open={dialogOpen}
            primaryButtonText='Upgrade now'
            secondaryButtonText='Remind me later'
            onClick={isAdmin ? onClickUpgrade : undefined}
            onClose={onClose}
            title='Upgrade to continue using Unleash'
            maxWidth='sm'
        >
            {text}
            {isAdmin ? (
                <StyledBillingInformation>
                    <Typography>
                        <StyledPrice>${seatPrice}</StyledPrice> per user billed
                        monthly
                    </Typography>
                    <StyledDetailList>
                        <li>Pay by credit card</li>
                        <li>Cancel anytime</li>
                    </StyledDetailList>
                </StyledBillingInformation>
            ) : (
                <Alert severity='info' sx={{ mt: 3, mb: 2 }}>
                    Contact your account admin to request an upgrade.
                </Alert>
            )}
            <Typography color='text.secondary'>
                Trusted by enterprises like
            </Typography>
            <StyledLogoList>
                <LenovoLogo />
                <DockerLogo />
                <VisaLogo />
                <SamsungLogo />
                <LloydsLogo />
            </StyledLogoList>
        </Dialogue>
    );
};
