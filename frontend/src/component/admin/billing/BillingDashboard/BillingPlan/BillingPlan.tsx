import type { FC } from 'react';
import { Alert, Grid, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    type IInstanceStatus,
    InstanceState,
    InstancePlan,
} from 'interfaces/instance';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { trialHasExpired, isTrialInstance } from 'utils/instanceTrial';
import { GridRow } from 'component/common/GridRow/GridRow';
import { GridCol } from 'component/common/GridCol/GridCol';
import { Badge } from 'component/common/Badge/Badge';
import { BillingDetails } from './BillingDetails';

export const BILLING_PLAN_PRICES: Record<string, number> = {
    [InstancePlan.PRO]: 80,
};

export const BILLING_PAYG_USER_PRICE = 75;
export const BILLING_PAYG_DEFAULT_MINIMUM_SEATS = 5;
export const BILLING_PRO_USER_PRICE = 15;
export const BILLING_PRO_DEFAULT_INCLUDED_SEATS = 5;
export const BILLING_INCLUDED_REQUESTS = 53_000_000;

const StyledPlanBox = styled('aside')(({ theme }) => ({
    padding: theme.spacing(2.5),
    height: '100%',
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: theme.boxShadows.elevated,
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(6.5),
    },
}));

const StyledPlanSpan = styled('span')(({ theme }) => ({
    fontSize: '3.25rem',
    lineHeight: 1,
    color: theme.palette.primary.main,
    fontWeight: 800,
    marginRight: theme.spacing(1.5),
}));

const StyledPAYGSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledTrialSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledPriceSpan = styled('span')(({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: theme.fontWeight.bold,
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(-1.5),
    [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(-4.5),
    },
}));

interface IBillingPlanProps {
    instanceStatus: IInstanceStatus;
}

export const BillingPlan: FC<IBillingPlanProps> = ({ instanceStatus }) => {
    const expired = trialHasExpired(instanceStatus);
    const {
        uiConfig: { billing },
    } = useUiConfig();

    const planPrice = BILLING_PLAN_PRICES[instanceStatus.plan] ?? 0;

    const isPAYG = billing === 'pay-as-you-go';
    const plan = `${instanceStatus.plan}${isPAYG ? ' Pay-as-You-Go' : ''}`;

    const inactive = instanceStatus.state !== InstanceState.ACTIVE;

    return (
        <Grid item xs={12} md={7}>
            <StyledPlanBox>
                <ConditionallyRender
                    condition={inactive}
                    show={
                        <StyledAlert severity='info'>
                            After you have sent your billing information, your
                            instance will be upgraded - you don't have to do
                            anything.{' '}
                            <a
                                href={`mailto:support@getunleash.io?subject=${plan} plan clarifications`}
                            >
                                Get in touch with us
                            </a>{' '}
                            for any clarification
                        </StyledAlert>
                    }
                />
                <Badge color='success'>Current plan</Badge>
                <Grid
                    container
                    sx={(theme) => ({ marginBottom: theme.spacing(3) })}
                >
                    <GridRow>
                        <GridCol>
                            <StyledPlanSpan>
                                {instanceStatus.plan}
                            </StyledPlanSpan>
                            <ConditionallyRender
                                condition={isTrialInstance(instanceStatus)}
                                show={
                                    <StyledTrialSpan
                                        sx={(theme) => ({
                                            color: expired
                                                ? theme.palette.error.dark
                                                : theme.palette.warning.dark,
                                        })}
                                    >
                                        {expired
                                            ? 'Trial expired'
                                            : instanceStatus.trialExtended
                                              ? 'Extended Trial'
                                              : 'Trial'}
                                    </StyledTrialSpan>
                                }
                            />
                        </GridCol>
                        <GridCol>
                            <ConditionallyRender
                                condition={planPrice > 0}
                                show={
                                    <StyledPriceSpan>
                                        ${planPrice.toFixed(2)}
                                    </StyledPriceSpan>
                                }
                            />
                        </GridCol>
                    </GridRow>
                    <GridRow>
                        <ConditionallyRender
                            condition={isPAYG}
                            show={
                                <StyledPAYGSpan>Pay-as-You-Go</StyledPAYGSpan>
                            }
                        />
                    </GridRow>
                </Grid>
                <BillingDetails
                    instanceStatus={instanceStatus}
                    isPAYG={isPAYG}
                />
            </StyledPlanBox>
        </Grid>
    );
};
