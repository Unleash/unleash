import { IUser } from 'interfaces/user';
import { useMemo } from 'react';
import { useInstanceStatus } from './api/getters/useInstanceStatus/useInstanceStatus';
import { STRIPE } from 'component/admin/billing/flags';
import { InstancePlan } from 'interfaces/instance';

export interface IUsersPlanOutput {
    planUsers: IUser[];
    isBillingUsers: boolean;
}

export const useUsersPlan = (users: IUser[]): IUsersPlanOutput => {
    const { instanceStatus } = useInstanceStatus();

    const isBillingUsers = STRIPE && instanceStatus?.plan === InstancePlan.PRO;
    const seats = instanceStatus?.seats ?? 5;

    const planUsers = useMemo(
        () => calculatePaidUsers(users, isBillingUsers, seats),
        [users, isBillingUsers, seats]
    );

    return {
        planUsers,
        isBillingUsers,
    };
};

const calculatePaidUsers = (
    users: IUser[],
    isBillingUsers: boolean,
    seats: number = 0
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
