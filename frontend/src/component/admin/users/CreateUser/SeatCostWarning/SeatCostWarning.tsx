import type { VFC } from 'react';
import { Alert } from '@mui/material';
import { useUsersPlan } from 'hooks/useUsersPlan';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import { BILLING_PRO_SEAT_PRICE } from 'component/admin/billing/BillingDashboard/BillingPlan/BillingPlan';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';

export const SeatCostWarning: VFC = () => {
    const { users } = useUsers();
    const { isBillingUsers, seats, planUsers } = useUsersPlan(users);
    const { instanceStatus } = useInstanceStatus();
    const seatPrice =
        instanceStatus?.prices?.pro?.seat ?? BILLING_PRO_SEAT_PRICE;

    if (!isBillingUsers || planUsers.length < seats) {
        return null;
    }

    return (
        <Alert
            severity='info'
            sx={{ marginBottom: (theme) => theme.spacing(3) }}
        >
            <p>
                <strong>Heads up!</strong> You are exceeding your allocated free
                members included in your plan ({planUsers.length} of {seats}).
                Creating this user will add <strong>${seatPrice}/month</strong>{' '}
                to your invoice, starting with your next payment.
            </p>
        </Alert>
    );
};
