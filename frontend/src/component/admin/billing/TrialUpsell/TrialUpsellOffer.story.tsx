import type { Story, StoryMeta } from 'component/stories/types';
import type { InstanceCredit } from 'interfaces/instance';
import { TrialUpsellOfferView } from './TrialUpsellOffer.tsx';

export const meta: StoryMeta = {
    title: 'Billing / TrialUpsellOffer',
    background: 'paper',
};

const credit = (
    code: string,
    name: string,
    amountCents: number,
    offerStatus: 'active' | 'ended',
    daysLeft = 14,
): InstanceCredit => ({
    source: 'campaign',
    status: 'attached',
    amountCents,
    usedCents: 0,
    campaign: {
        code,
        name,
        redeemableUntil: new Date(
            Date.now() + daysLeft * 24 * 60 * 60 * 1000,
        ).toISOString(),
        offerStatus,
    },
});

export const OneActiveOffer: Story = () => (
    <TrialUpsellOfferView
        credits={[credit('LENNY1K', "Lenny's Newsletter", 100000, 'active')]}
        locale='en-US'
    />
);

export const ActiveAndEndedOffers: Story = () => (
    <TrialUpsellOfferView
        credits={[
            credit('LENNY1K', "Lenny's Newsletter", 100000, 'active'),
            credit('SPRING', 'Spring promo', 50000, 'active', 180),
            credit('LAUNCH', 'Launch week', 25000, 'ended'),
        ]}
        locale='en-US'
    />
);

export const AllOffersEnded: Story = () => (
    <TrialUpsellOfferView
        credits={[credit('LAUNCH', 'Launch week', 25000, 'ended')]}
        locale='en-US'
    />
);
