import { useContext } from 'react';
import { Alert, Button, Link, styled, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { formatApiPath } from 'utils/formatPath';
import { ReactComponent as LenovoLogo } from 'assets/logos/lenovo.svg';
import AccessContext from 'contexts/AccessContext';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { useInstancePrices } from 'hooks/api/getters/useInstancePrices/useInstancePrices';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { ReactComponent as DockerLogo } from 'assets/logos/docker.svg';
import { ReactComponent as VisaLogo } from 'assets/logos/visa.svg';
import { ReactComponent as SamsungLogo } from 'assets/logos/samsung.svg';
import { ReactComponent as LloydsLogo } from 'assets/logos/lloyds.svg';
import { trialHasExpired } from 'utils/instanceTrial';
import { parseISO } from 'date-fns';
import { formatDateDM } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';

const StyledBillingInformation = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(1.5, 3, 2.5, 3),
    border: `1px solid ${theme.palette.secondary.border}`,
    backgroundColor: theme.palette.secondary.light,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export interface ITrialUpsellProps {
    isAdmin: boolean;
    seatPrice: number;
    trialExpiry?: string;
    trialExpired?: boolean;
    onUpgrade?: () => void;
    locale: string;
}

export const ConnectedTrialUpsell = () => {
    const { hasAccess } = useContext(AccessContext);
    const { instancePrices } = useInstancePrices();
    const { instanceStatus } = useInstanceStatus();
    const { locationSettings } = useLocationSettings();

    const onUpgrade = () => {
        window.location.assign(formatApiPath('api/admin/invoices/checkout'));
    };

    return (
        <TrialUpsell
            isAdmin={hasAccess(ADMIN)}
            seatPrice={instancePrices.payg.seat}
            trialExpiry={instanceStatus?.trialExpiry}
            trialExpired={trialHasExpired(instanceStatus)}
            onUpgrade={onUpgrade}
            locale={locationSettings?.locale}
        />
    );
};

const formatTrialExpiry = (locale: string, trialExpiry?: string): string => {
    if (!trialExpiry) return '';

    return formatDateDM(parseISO(trialExpiry), locale);
};

export const TrialUpsell = ({
    isAdmin,
    seatPrice,
    trialExpiry,
    trialExpired = false,
    onUpgrade,
    locale,
}: ITrialUpsellProps) => {
    const expiryText = trialExpiry
        ? `on ${formatTrialExpiry(locale, trialExpiry)}`
        : 'soon';

    const descriptionText = trialExpired
        ? 'Your free trial has expired and your account is scheduled for deletion. Upgrade to preserve your projects and feature flags.'
        : `Your trial expires ${expiryText}. Upgrade now to get uninterrupted usage of Unleash.`;

    return (
        <>
            {isAdmin ? (
                <>
                    <Typography variant='h2' sx={{ mb: 1 }}>
                        {trialExpired
                            ? 'Upgrade to continue using Unleash'
                            : '14 day free trial'}
                    </Typography>
                    <Typography variant='body2'>
                        {descriptionText}{' '}
                        <Link
                            href='https://www.getunleash.io/pricing'
                            target='_blank'
                            rel='noreferrer'
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            View full pricing
                            <OpenInNewIcon fontSize='inherit' />
                        </Link>
                    </Typography>
                    <StyledBillingInformation>
                        <div>
                            <Typography>
                                <StyledPrice>${seatPrice}</StyledPrice> per user
                                billed monthly
                            </Typography>
                            <StyledDetailList>
                                <li>Pay by credit card</li>
                                <li>Cancel anytime</li>
                            </StyledDetailList>
                        </div>
                        {onUpgrade && (
                            <Button variant='contained' onClick={onUpgrade}>
                                Upgrade now
                            </Button>
                        )}
                    </StyledBillingInformation>
                </>
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
        </>
    );
};
