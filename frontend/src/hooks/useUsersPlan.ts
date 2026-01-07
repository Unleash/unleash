import type { IUser } from 'interfaces/user';
import { useMemo } from 'react';
import { useInstanceStatus } from './api/getters/useInstanceStatus/useInstanceStatus.js';
import { InstancePlan } from 'interfaces/instance';
import { BILLING_PRO_DEFAULT_INCLUDED_SEATS } from 'component/admin/billing/BillingDashboard/BillingPlan/BillingPlan';

export interface IUsersPlanOutput {
    planUsers: IUser[];
    isBillingUsers: boolean;
    seats: number;
    extraSeats: number;
}

export const useUsersPlan = (users: IUser[]): IUsersPlanOutput => {
    const { instanceStatus } = useInstanceStatus();

    const isBillingUsers = Boolean(instanceStatus?.plan === InstancePlan.PRO);
    const seats = BILLING_PRO_DEFAULT_INCLUDED_SEATS;

    const planUsers = useMemo(
        () => calculatePaidUsers(users, isBillingUsers, seats),
        [users, isBillingUsers, seats],
    );

    const extraSeats = planUsers.filter((user) => user.paid).length;

    return {
        seats,
        extraSeats,
        planUsers,
        isBillingUsers,
    };
};

const calculatePaidUsers = (
    users: IUser[],
    isBillingUsers: boolean,
    seats: number = 0,
) => {
    if (!isBillingUsers || !seats) return users;

    users
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .forEach((user, index) => {
            user.paid = false;

            // If index is greater or equal to seat, the
            // user isn't paid for and we will add use this
            // to add costs and icons in the userlist
            if (index >= seats) {
                user.paid = true;
            }
        });

    return users;
};
