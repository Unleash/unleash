import { Grid } from '@mui/material';
import { BillingInformation } from './BillingInformation/BillingInformation';
import { BillingPlan } from './BillingPlan/BillingPlan';

export const BillingDashboard = () => {
    return (
        <Grid container spacing={4}>
            <BillingInformation />
            <BillingPlan />
        </Grid>
    );
};
