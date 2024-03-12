import { Grid } from '@mui/material';
import type { IInstanceStatus } from 'interfaces/instance';
import type { VFC } from 'react';
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
