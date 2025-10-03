import { Grid } from '@mui/material';
import { BillingInformation } from './BillingInformation/BillingInformation.tsx';
import { BillingPlan } from './BillingPlan/BillingPlan.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';

export const BillingDashboard = () => {
    const trafficBillingDisplay = useUiFlag('trafficBillingDisplay');

    return (
        <Grid container spacing={trafficBillingDisplay ? 2 : 4}>
            <BillingInformation />
            <BillingPlan />
        </Grid>
    );
};
