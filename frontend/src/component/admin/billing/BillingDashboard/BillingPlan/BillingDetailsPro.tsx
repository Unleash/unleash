import { Link } from 'react-router-dom';
import { Divider, Grid, styled, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { GridRow } from 'component/common/GridRow/GridRow';
import { GridCol } from 'component/common/GridCol/GridCol';
import { GridColLink } from './GridColLink/GridColLink.tsx';
import type { InstancePrices } from 'interfaces/instance';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import {
    BILLING_INCLUDED_REQUESTS,
    BILLING_PRO_DEFAULT_INCLUDED_SEATS,
} from './BillingPlan.tsx';
import { useOverageCost } from './useOverageCost.ts';

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
    instancePrices: InstancePrices;
}

export const BillingDetailsPro = ({
    instancePrices,
}: IBillingDetailsProProps) => {
    const { users, loading } = useUsers();

    const eligibleUsers = users.filter((user) => user.email);

    const planPrice = instancePrices.pro.base;
    const seatPrice = instancePrices.pro.seat;
    const trafficPrice = instancePrices.pro.traffic;
    const seats = BILLING_PRO_DEFAULT_INCLUDED_SEATS;

    const freeAssigned = Math.min(eligibleUsers.length, seats);
    const paidAssigned = eligibleUsers.length - freeAssigned;
    const paidAssignedPrice = seatPrice * paidAssigned;
    const overageCost = useOverageCost(BILLING_INCLUDED_REQUESTS);

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
                            ${seatPrice}/month per paid member
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
                                    ${trafficPrice} per 1 million started above
                                    included data
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
