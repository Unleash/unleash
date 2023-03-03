import { VFC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Link } from '@mui/material';
import { useUsersPlan } from 'hooks/useUsersPlan';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';

const userLimit = 20;

export const UserLimitWarning: VFC = () => {
    const { users } = useUsers();
    const { isBillingUsers, planUsers } = useUsersPlan(users);

    if (!isBillingUsers) {
        return null;
    }

    if (planUsers?.length < userLimit) {
        return null;
    }

    return (
        <Alert severity="info" sx={{ marginBottom: theme => theme.spacing(3) }}>
            <p>
                <strong>Heads up!</strong> You have reached your maximum number
                of registered users for you PRO account (up to max {userLimit}{' '}
                users). If you need more users please{' '}
                <Link
                    component={RouterLink}
                    to="https://www.getunleash.io/signup-enterprise"
                >
                    get in touch with us
                </Link>
                .
            </p>
        </Alert>
    );
};
