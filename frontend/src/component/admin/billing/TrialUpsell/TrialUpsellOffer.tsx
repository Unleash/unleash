import { styled, Tooltip, Typography } from '@mui/material';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import type { InstanceCredit } from 'interfaces/instance';
import { formatDateYMDHM } from 'utils/formatDate';
import { formatCurrency } from '../BillingInvoices/BillingInvoice/formatCurrency.ts';

const StyledOfferCard = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(2),
    padding: theme.spacing(2, 3),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.primary.container,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledOfferTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.fontSizes.mainHeader,
}));

const StyledSecondary = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const StyledDeadline = styled('span')({
    textDecoration: 'underline dotted',
    cursor: 'help',
});

const StyledEndedOffers = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1.5),
}));

const isActive = ({ campaign }: InstanceCredit) =>
    campaign.offerStatus === 'active';

export const filterUnredeemedCredits = (credits: InstanceCredit[]) =>
    credits.filter(
        ({ status }) => status === 'attached' || status === 'granted',
    );

export const sumActiveOfferCents = (credits: InstanceCredit[]) =>
    credits
        .filter(isActive)
        .reduce((sum, { amountCents }) => sum + amountCents, 0);

const formatCredit = (cents: number) => formatCurrency(cents / 100, 'USD');

export const TrialUpsellOfferView = ({
    credits,
    locale,
}: {
    credits: InstanceCredit[];
    locale: string;
}) => {
    const active = credits.filter(isActive);
    const ended = credits.filter((credit) => !isActive(credit));

    return (
        <>
            {active.length > 0 && (
                <StyledOfferCard>
                    <StyledOfferTitle>
                        {`You get ${formatCredit(sumActiveOfferCents(active))} in credit`}
                    </StyledOfferTitle>
                    {active.map(({ amountCents, campaign }) => (
                        <div key={campaign.code}>
                            <Typography>
                                {`From ${campaign.name} · code ${campaign.code}`}
                                {active.length > 1 &&
                                    ` · ${formatCredit(amountCents)}`}
                            </Typography>
                            <StyledSecondary>
                                Limited offer: ends{' '}
                                <Tooltip
                                    title={formatDateYMDHM(
                                        campaign.redeemableUntil,
                                        locale,
                                    )}
                                    arrow
                                >
                                    <StyledDeadline tabIndex={0}>
                                        <TimeAgo
                                            date={campaign.redeemableUntil}
                                        />
                                    </StyledDeadline>
                                </Tooltip>
                                , while spots last.
                            </StyledSecondary>
                        </div>
                    ))}
                    <Typography>Upgrade and add a card to use it.</Typography>
                </StyledOfferCard>
            )}
            {ended.length > 0 && (
                <StyledEndedOffers>
                    {ended.map(({ amountCents, campaign }) => (
                        <StyledSecondary key={campaign.code}>
                            {`${campaign.code} · ${formatCredit(amountCents)} · This offer has ended`}
                        </StyledSecondary>
                    ))}
                </StyledEndedOffers>
            )}
        </>
    );
};
