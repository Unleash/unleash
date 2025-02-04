import { Link } from 'react-router-dom';
import { Divider, Grid, styled, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { GridRow } from 'component/common/GridRow/GridRow';
import { GridCol } from 'component/common/GridCol/GridCol';
import { GridColLink } from './GridColLink/GridColLink';
import type { IInstanceStatus } from 'interfaces/instance';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useMemo } from 'react';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import { useTrafficDataEstimation } from 'hooks/useTrafficData';
import {
    BILLING_INCLUDED_REQUESTS,
    BILLING_PLAN_PRICES,
    BILLING_PRO_DEFAULT_INCLUDED_SEATS,
    BILLING_PRO_USER_PRICE,
    BILLING_TRAFFIC_BUNDLE_PRICE,
} from './BillingPlan';
import { useInstanceTrafficMetrics } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import { calculateOverageCost } from 'utils/traffic-calculations';

const StyledInfoLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const StyledCheckIcon = styled(CheckIcon)(({ theme }) => ({
    fontSize: '1rem',
    marginRight: theme.spacing(1),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: `${theme.spacing(3)} 0`,
}));

interface IBillingDetailsProProps {
    instanceStatus: IInstanceStatus;
}

export const BillingDetailsPro = ({
    instanceStatus,
}: IBillingDetailsProProps) => {
    const { users, loading } = useUsers();

    const {
        currentPeriod,
        toChartData,
        toTrafficUsageSum,
        endpointsInfo,
        getDayLabels,
    } = useTrafficDataEstimation();

    const eligibleUsers = users.filter((user) => user.email);

    const planPrice = BILLING_PLAN_PRICES[instanceStatus.plan];
    const seats = BILLING_PRO_DEFAULT_INCLUDED_SEATS;

    const freeAssigned = Math.min(eligibleUsers.length, seats);
    const paidAssigned = eligibleUsers.length - freeAssigned;
    const paidAssignedPrice = BILLING_PRO_USER_PRICE * paidAssigned;
    const includedTraffic = BILLING_INCLUDED_REQUESTS;
    const traffic = useInstanceTrafficMetrics(currentPeriod.key);

    const overageCost = useMemo(() => {
        if (!includedTraffic) {
            return 0;
        }
        const trafficData = toChartData(
            getDayLabels(currentPeriod.dayCount),
            traffic,
            endpointsInfo,
        );
        const totalTraffic = toTrafficUsageSum(trafficData);
        return calculateOverageCost(
            totalTraffic,
            includedTraffic,
            BILLING_TRAFFIC_BUNDLE_PRICE,
        );
    }, [includedTraffic, traffic, currentPeriod, endpointsInfo]);

    const totalCost = planPrice + paidAssignedPrice + overageCost;

    if (loading) return null;

    return (
        <>
            <Grid container>
                <GridRow
                    sx={(theme) => ({
                        marginBottom: theme.spacing(1.5),
                    })}
                >
                    <GridCol vertical>
                        <Typography>
                            <strong>Included members</strong>
                            <GridColLink>
                                <Link to='/admin/users'>
                                    {freeAssigned} of {seats} assigned
                                </Link>
                            </GridColLink>
                        </Typography>
                        <StyledInfoLabel>
                            You have {seats} team members included in your PRO
                            plan
                        </StyledInfoLabel>
                    </GridCol>
                    <GridCol>
                        <StyledCheckIcon />
                        <Typography variant='body2'>included</Typography>
                    </GridCol>
                </GridRow>
                <GridRow
                    sx={(theme) => ({
                        marginBottom: theme.spacing(1.5),
                    })}
                >
                    <GridCol vertical>
                        <Typography>
                            <strong>Paid members</strong>
                            <GridColLink>
                                <Link to='/admin/users'>
                                    {paidAssigned} assigned
                                </Link>
                            </GridColLink>
                        </Typography>
                        <StyledInfoLabel>
                            ${BILLING_PRO_USER_PRICE}/month per paid member
                        </StyledInfoLabel>
                    </GridCol>
                    <GridCol>
                        <Typography
                            sx={(theme) => ({
                                fontSize: theme.fontSizes.mainHeader,
                            })}
                        >
                            ${paidAssignedPrice.toFixed(2)}
                        </Typography>
                    </GridCol>
                </GridRow>
                <ConditionallyRender
                    condition={overageCost > 0}
                    show={
                        <GridRow>
                            <GridCol vertical>
                                <Typography>
                                    <strong>Accrued traffic charges</strong>
                                    <GridColLink>
                                        <Link to='/admin/network/data-usage'>
                                            view details
                                        </Link>
                                    </GridColLink>
                                </Typography>
                                <StyledInfoLabel>
                                    ${BILLING_TRAFFIC_BUNDLE_PRICE} per 1
                                    million started above included data
                                </StyledInfoLabel>
                            </GridCol>
                            <GridCol>
                                <Typography
                                    sx={(theme) => ({
                                        fontSize: theme.fontSizes.mainHeader,
                                    })}
                                >
                                    ${overageCost.toFixed(2)}
                                </Typography>
                            </GridCol>
                        </GridRow>
                    }
                />
            </Grid>
            <StyledDivider />
            <Grid container>
                <GridRow>
                    <GridCol>
                        <Typography
                            sx={(theme) => ({
                                fontWeight: theme.fontWeight.bold,
                                fontSize: theme.fontSizes.mainHeader,
                            })}
                        >
                            Total
                        </Typography>
                    </GridCol>
                    <GridCol>
                        <Typography
                            sx={(theme) => ({
                                fontWeight: theme.fontWeight.bold,
                                fontSize: '2rem',
                            })}
                        >
                            ${totalCost.toFixed(2)}
                        </Typography>
                    </GridCol>
                </GridRow>
            </Grid>
        </>
    );
};
