import { Alert, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import IRole from 'interfaces/role';
import { RoleDeleteDialogUsers } from './RoleDeleteDialogUsers/RoleDeleteDialogUsers';
import { RoleDeleteDialogServiceAccounts } from './RoleDeleteDialogServiceAccounts/RoleDeleteDialogServiceAccounts';

const StyledTableContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1.5),
}));

const StyledLabel = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

interface IRoleDeleteDialogProps {
    role?: IRole;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: (role: IRole) => void;
}

export const RoleDeleteDialog = ({
    role,
    open,
    setOpen,
    onConfirm,
}: IRoleDeleteDialogProps) => {
    const { users } = useUsers();
    const { serviceAccounts } = useServiceAccounts();

    const roleUsers = users.filter(({ rootRole }) => rootRole === role?.id);
    const roleServiceAccounts = serviceAccounts.filter(
        ({ rootRole }) => rootRole === role?.id
    );

    const deleteMessage = (
        <>
            You are about to delete role: <strong>{role?.name}</strong>
        </>
    );

    return (
        <Dialogue
            title="Delete role?"
            open={open}
            primaryButtonText="Delete role"
            secondaryButtonText="Cancel"
            onClick={() => onConfirm(role!)}
            onClose={() => {
                setOpen(false);
            }}
        >
            <ConditionallyRender
                condition={Boolean(
                    roleUsers.length || roleServiceAccounts.length
                )}
                show={
                    <>
                        <Alert severity="error">
                            If you delete this role, all current accounts
                            associated with it will be automatically assigned
                            the preconfigured <strong>Viewer</strong> role.
                        </Alert>
                        <StyledLabel>{deleteMessage}</StyledLabel>
                        <ConditionallyRender
                            condition={Boolean(roleUsers.length)}
                            show={
                                <>
                                    <StyledLabel>
                                        Users ({roleUsers.length}):
                                    </StyledLabel>
                                    <StyledTableContainer>
                                        <RoleDeleteDialogUsers
                                            users={roleUsers}
                                        />
                                    </StyledTableContainer>
                                </>
                            }
                        />
                        <ConditionallyRender
                            condition={Boolean(roleServiceAccounts.length)}
                            show={
                                <>
                                    <StyledLabel>
                                        Service accounts (
                                        {roleServiceAccounts.length}):
                                    </StyledLabel>
                                    <StyledTableContainer>
                                        <RoleDeleteDialogServiceAccounts
                                            serviceAccounts={
                                                roleServiceAccounts
                                            }
                                        />
                                    </StyledTableContainer>
                                </>
                            }
                        />
                    </>
                }
                elseShow={<p>{deleteMessage}</p>}
            />
        </Dialogue>
    );
};
