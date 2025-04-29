import { Grid } from '@mui/material';
import { BillingInformation } from './BillingInformation/BillingInformation.tsx';
import { BillingPlan } from './BillingPlan/BillingPlan.tsx';

export const BillingDashboard = () => {
    return (
        <Grid container spacing={4}>
            <BillingInformation />
            <BillingPlan />
        </Grid>
    );
};
