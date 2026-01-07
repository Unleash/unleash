import { Alert, Grid, Paper, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { InstancePlan, InstanceState } from 'interfaces/instance';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { trialHasExpired, isTrialInstance } from 'utils/instanceTrial';
import { GridRow } from 'component/common/GridRow/GridRow';
import { GridCol } from 'component/common/GridCol/GridCol';
import { Badge } from 'component/common/Badge/Badge';
import { BillingDetails } from './BillingDetails.tsx';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';

export const BILLING_PRO_BASE_PRICE = 80;
export const BILLING_PRO_SEAT_PRICE = 15;
export const BILLING_PAYG_SEAT_PRICE = 75;
export const BILLING_TRAFFIC_PRICE = 5;

export const BILLING_PAYG_DEFAULT_MINIMUM_SEATS = 5;
export const BILLING_PRO_DEFAULT_INCLUDED_SEATS = 5;
export const BILLING_INCLUDED_REQUESTS = 53_000_000;

const StyledPlanBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    height: '100%',
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
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

export const BillingPlan = () => {
    const {
        uiConfig: { billing },
    } = useUiConfig();
    const { instanceStatus } = useInstanceStatus();

    const isPro =
        instanceStatus?.plan && instanceStatus?.plan === InstancePlan.PRO;
    const isPAYG = billing === 'pay-as-you-go';
    const isEnterpriseConsumption = billing === 'enterprise-consumption';

    if (!instanceStatus)
        return (
            <Grid item xs={12} md={7}>
                <StyledPlanBox data-loading sx={{ flex: 1, height: '400px' }} />
            </Grid>
        );

    const expired = trialHasExpired(instanceStatus);
    const baseProPrice =
        instanceStatus.prices?.pro?.base ?? BILLING_PRO_BASE_PRICE;
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
                                condition={Boolean(isPro)}
                                show={
                                    <StyledPriceSpan>
                                        ${baseProPrice.toFixed(2)}
                                    </StyledPriceSpan>
                                }
                            />
                        </GridCol>
                    </GridRow>
                    <GridRow>
                        <ConditionallyRender
                            condition={isPAYG || isEnterpriseConsumption}
                            show={
                                <StyledPAYGSpan>
                                    Pay-as-You-Go{' '}
                                    {isEnterpriseConsumption
                                        ? 'Consumption'
                                        : ''}
                                </StyledPAYGSpan>
                            }
                        />
                    </GridRow>
                </Grid>
                <BillingDetails
                    instanceStatus={instanceStatus}
                    isPAYG={isPAYG}
                    isEnterpriseConsumption={isEnterpriseConsumption}
                />
            </StyledPlanBox>
        </Grid>
    );
};
