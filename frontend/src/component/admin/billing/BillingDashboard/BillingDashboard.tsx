import { Grid } from '@mui/material';
import { IInstanceStatus } from 'interfaces/instance';
import { VFC } from 'react';
import { BillingInformation } from './BillingInformation/BillingInformation';
import { BillingPlan } from './BillingPlan/BillingPlan';

interface IBillingDashboardProps {
    instanceStatus: IInstanceStatus;
}

export const BillingDashboard: VFC<IBillingDashboardProps> = ({
    instanceStatus,
}) => {
    return (
        <Grid container spacing={4}>
            <BillingInformation instanceStatus={instanceStatus} />
            <BillingPlan instanceStatus={instanceStatus} />
        </Grid>
    );
};
