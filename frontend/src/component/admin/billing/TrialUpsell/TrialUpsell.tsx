import { useContext } from 'react';
import { Alert, Box, Button, styled, Typography } from '@mui/material';
import { formatApiPath } from 'utils/formatPath';
import LenovoLogo from 'assets/logos/lenovo.svg?react';
import AccessContext from 'contexts/AccessContext';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { useInstancePrices } from 'hooks/api/getters/useInstancePrices/useInstancePrices';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import DockerLogo from 'assets/logos/docker.svg?react';
import VisaLogo from 'assets/logos/visa.svg?react';
import SamsungLogo from 'assets/logos/samsung.svg?react';
import LloydsLogo from 'assets/logos/lloyds.svg?react';
import { trialHasExpired } from 'utils/instanceTrial';
import { TrialUpsellDescription } from './TrialUpsellDescription';
import { useEventTracker } from 'hooks/useEventTracker';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { useInstanceCredits } from 'hooks/api/getters/useInstanceCredits/useInstanceCredits';
import {
    sumActiveOfferCents,
    filterUnredeemedCredits,
    TrialUpsellOfferView,
} from './TrialUpsellOffer.tsx';
import useLoading from 'hooks/useLoading';

const StyledBillingInformation = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(1.5, 4, 1.5, 3),
    border: `1px solid ${theme.palette.primary.containerBorder}`,
    backgroundColor: theme.palette.primary.container,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledBillingInformationTextContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledPrice = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.fontSizes.largeHeader,
}));

const StyledDetailListContainer = styled(Box)(({ theme }) => ({
    margin: 0,
    padding: 0,
    marginLeft: theme.spacing(2.5),
    marginTop: theme.spacing(1),
}));

const StyledDetailList = styled('ul')(({ theme }) => ({
    display: 'flex',
    margin: 0,
    padding: 0,
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

export const TrialUpsell = () => {
    const { hasAccess } = useContext(AccessContext);
    const { instancePrices } = useInstancePrices();
    const { instanceStatus } = useInstanceStatus();
    const { trackEvent } = useEventTracker();
    const { locationSettings } = useLocationSettings();
    const isAdmin = hasAccess(ADMIN);
    const { credits, loading: creditsLoading } = useInstanceCredits();
    const loadingRef = useLoading(creditsLoading);
    const offers = filterUnredeemedCredits(credits);
    const activeCents = sumActiveOfferCents(offers);

    const onUpgrade = () => {
        trackEvent('upgrade-trial-billing-page', {
            props: {
                eventType: 'upgrade_click',
            },
        });
        window.location.assign(formatApiPath('api/admin/invoices/checkout'));
    };

    const seatPrice = instancePrices.payg.seat;
    const trialExpired = trialHasExpired(instanceStatus);

    return (
        <div ref={loadingRef} aria-busy={creditsLoading}>
            <Typography variant='h2' sx={{ mb: 1 }}>
                {trialExpired
                    ? 'Upgrade to continue using Unleash'
                    : '14 day free trial'}
            </Typography>
            <TrialUpsellDescription />
            {isAdmin ? (
                <>
                    {offers.length > 0 && (
                        <TrialUpsellOfferView
                            credits={offers}
                            locale={locationSettings.locale}
                        />
                    )}
                    <StyledBillingInformation data-loading>
                        <StyledBillingInformationTextContainer>
                            <Typography>
                                <StyledPrice>${seatPrice}</StyledPrice> per user
                                billed monthly
                            </Typography>
                            <StyledDetailListContainer>
                                <StyledDetailList>
                                    <li>
                                        {activeCents > 0
                                            ? 'Pay by credit card to use your credit'
                                            : 'Pay by credit card'}
                                    </li>
                                    <li>Cancel anytime</li>
                                </StyledDetailList>
                            </StyledDetailListContainer>
                        </StyledBillingInformationTextContainer>
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
            <Typography
                sx={{
                    color: 'text.secondary',
                }}
            >
                Trusted by enterprises like
            </Typography>
            <StyledLogoList>
                <LenovoLogo />
                <DockerLogo />
                <VisaLogo />
                <SamsungLogo />
                <LloydsLogo />
            </StyledLogoList>
        </div>
    );
};
