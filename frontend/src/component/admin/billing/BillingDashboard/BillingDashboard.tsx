import Grid from '@mui/material/Grid';
import { BillingInformation } from './BillingInformation/BillingInformation.tsx';
import { BillingPlan } from './BillingPlan/BillingPlan.tsx';

export const BillingDashboard = () => {
    return (
        <Grid container spacing={2}>
            <BillingInformation />
            <BillingPlan />
        </Grid>
    );
};
