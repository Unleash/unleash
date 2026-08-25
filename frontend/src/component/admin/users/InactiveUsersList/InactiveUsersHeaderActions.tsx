import { useState } from 'react';
import { Button } from '@mui/material';
import { useInactiveUsers } from 'hooks/api/getters/useInactiveUsers/useInactiveUsers';
import { useInactiveUsersApi } from 'hooks/api/actions/useInactiveUsersApi/useInactiveUsersApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { DeleteInactiveUsers } from './DeleteInactiveUsers/DeleteInactiveUsers.tsx';

export const InactiveUsersHeaderActions = () => {
    const { inactiveUsers, refetchInactiveUsers, loading } = useInactiveUsers();
    const { deleteInactiveUsers, errors: inactiveUsersApiErrors } =
        useInactiveUsersApi();
    const { setToastData, setToastApiError } = useToast();
    const [showDelInactiveDialog, setShowDelInactiveDialog] = useState(false);

    const onDelInactive = async () => {
        try {
            await deleteInactiveUsers(inactiveUsers.map((i) => i.id));
            setToastData({
                text: `Inactive users has been deleted`,
                type: 'success',
            });
            setShowDelInactiveDialog(false);
            refetchInactiveUsers();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            <Button
                variant='contained'
                color='primary'
                onClick={() => setShowDelInactiveDialog(true)}
                disabled={inactiveUsers.length === 0}
            >
                Delete all inactive users
            </Button>
            <DeleteInactiveUsers
                showDialog={showDelInactiveDialog}
                closeDialog={() => setShowDelInactiveDialog(false)}
                inactiveUsersLoading={loading}
                inactiveUserApiErrors={inactiveUsersApiErrors}
                inactiveUsers={inactiveUsers}
                removeInactiveUsers={onDelInactive}
            />
        </>
    );
};
