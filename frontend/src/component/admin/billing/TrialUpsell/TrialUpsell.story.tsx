import type { ReactNode } from 'react';
import { type Middleware, SWRConfig, unstable_serialize } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import type { Story, StoryMeta } from 'component/stories/types';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import {
    type IInstanceStatus,
    type InstanceCredit,
    InstancePlan,
    InstanceState,
} from 'interfaces/instance';
import { TrialUpsell } from './TrialUpsell.tsx';

export const meta: StoryMeta = {
    title: 'Billing / TrialUpsell',
    background: 'paper',
};

const trial: IInstanceStatus = {
    plan: InstancePlan.PRO,
    state: InstanceState.TRIAL,
    trialExpiry: '2026-12-08T23:59:59.999Z',
    minSeats: 5,
};

const lenny: InstanceCredit = {
    source: 'campaign',
    status: 'attached',
    amountCents: 100000,
    usedCents: 0,
    campaign: {
        code: 'LENNY1K',
        name: "Lenny's Newsletter",
        redeemableUntil: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        offerStatus: 'active',
    },
};

const creditsPath = formatApiPath('api/instance/credits');

const creditsStillLoading: Middleware =
    (useSWRNext) => (key, fetcher, config) => {
        const result = useSWRNext(key, fetcher, config);
        return key === creditsPath
            ? { ...result, data: undefined, isLoading: true }
            : result;
    };

const Setup = ({
    children,
    status = trial,
    credits = [],
    creditsLoading = false,
}: {
    children: ReactNode;
    status?: IInstanceStatus;
    credits?: InstanceCredit[];
    creditsLoading?: boolean;
}) => (
    <SWRConfig
        value={{
            provider: () => new Map(),
            fallback: {
                [formatApiPath('api/admin/ui-config')]: {
                    flags: { UNLEASH_CLOUD: true, paygCredits: true },
                },
                [unstable_serialize(['useInstanceStatus', true])]: status,
                [formatApiPath('api/instance/prices')]: {
                    pro: { base: 80, seat: 15, traffic: 5 },
                    payg: { seat: 20, traffic: 5 },
                },
                [creditsPath]: { credits },
            },
            isPaused: () => true,
            use: creditsLoading ? [creditsStillLoading] : [],
        }}
    >
        <AccessProviderMock permissions={[{ permission: ADMIN }]}>
            {children}
        </AccessProviderMock>
    </SWRConfig>
);

export const WithOffer: Story = () => (
    <Setup credits={[lenny]}>
        <TrialUpsell />
    </Setup>
);

export const ExpiredTrialWithOffer: Story = () => (
    <Setup
        status={{ ...trial, state: InstanceState.EXPIRED }}
        credits={[lenny]}
    >
        <TrialUpsell />
    </Setup>
);

export const NoOffer: Story = () => (
    <Setup>
        <TrialUpsell />
    </Setup>
);

export const UpgradeWaitsForCredits: Story = () => (
    <Setup creditsLoading>
        <TrialUpsell />
    </Setup>
);
