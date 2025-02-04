import { Link } from 'react-router-dom';
import { Divider, Grid, styled, Typography } from '@mui/material';
import { GridRow } from 'component/common/GridRow/GridRow';
import { GridCol } from 'component/common/GridCol/GridCol';
import { GridColLink } from './GridColLink/GridColLink';
import type { IInstanceStatus } from 'interfaces/instance';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import {
    BILLING_INCLUDED_REQUESTS,
    BILLING_PAYG_DEFAULT_MINIMUM_SEATS,
    BILLING_PAYG_USER_PRICE,
    BILLING_TRAFFIC_BUNDLE_PRICE,
} from './BillingPlan';
import { useTrafficDataEstimation } from 'hooks/useTrafficData';
import { useInstanceTrafficMetrics } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import { useMemo } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { calculateOverageCost } from 'utils/traffic-calculations';

const StyledInfoLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: `${theme.spacing(3)} 0`,
}));

interface IBillingDetailsPAYGProps {
    instanceStatus: IInstanceStatus;
}

export const BillingDetailsPAYG = ({
    instanceStatus,
}: IBillingDetailsPAYGProps) => {
    const { users, loading } = useUsers();
    const {
        currentPeriod,
        toChartData,
        toTrafficUsageSum,
        endpointsInfo,
        getDayLabels,
    } = useTrafficDataEstimation();

    const eligibleUsers = users.filter((user) => user.email);

    const minSeats =
        instanceStatus.minSeats ?? BILLING_PAYG_DEFAULT_MINIMUM_SEATS;

    const billableUsers = Math.max(eligibleUsers.length, minSeats);
    const usersCost = BILLING_PAYG_USER_PRICE * billableUsers;

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

    const totalCost = usersCost + overageCost;

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
                            <strong>Paid members</strong>
                            <GridColLink>
                                <Link to='/admin/users'>
                                    {eligibleUsers.length} assigned of{' '}
                                    {minSeats} minimum
                                </Link>
                            </GridColLink>
                        </Typography>
                        <StyledInfoLabel>
                            ${BILLING_PAYG_USER_PRICE}/month per paid member
                        </StyledInfoLabel>
                    </GridCol>
                    <GridCol>
                        <Typography
                            sx={(theme) => ({
                                fontSize: theme.fontSizes.mainHeader,
                            })}
                        >
                            ${usersCost.toFixed(2)}
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
