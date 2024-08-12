import { Alert, styled } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import type { IRole } from 'interfaces/role';
import { RoleDeleteDialogUsers } from './RoleDeleteDialogUsers';
import { RoleDeleteDialogServiceAccounts } from './RoleDeleteDialogServiceAccounts';
import { useGroups } from 'hooks/api/getters/useGroups/useGroups';
import { RoleDeleteDialogGroups } from './RoleDeleteDialogGroups';

const StyledTableContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1.5),
}));

const StyledLabel = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

interface IRoleDeleteDialogRootRoleProps {
    role?: IRole;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: (role: IRole) => void;
}

export const RoleDeleteDialogRootRole = ({
    role,
    open,
    setOpen,
    onConfirm,
}: IRoleDeleteDialogRootRoleProps) => {
    const { users } = useUsers();
    const { serviceAccounts } = useServiceAccounts();
    const { groups } = useGroups();

    const roleUsers = users.filter(({ rootRole }) => rootRole === role?.id);
    const roleServiceAccounts = serviceAccounts.filter(
        ({ rootRole }) => rootRole === role?.id,
    );
    const roleGroups = groups?.filter(({ rootRole }) => rootRole === role?.id);

    const entitiesWithRole = Boolean(
        roleUsers.length || roleServiceAccounts.length || roleGroups?.length,
    );

    return (
        <Dialogue
            title='Delete root role?'
            open={open}
            primaryButtonText='Delete role'
            secondaryButtonText='Cancel'
            disabledPrimaryButton={entitiesWithRole}
            onClick={() => onConfirm(role!)}
            onClose={() => {
                setOpen(false);
            }}
        >
            {entitiesWithRole ? (
                <>
                    <Alert severity='error'>
                        You are not allowed to delete a role that is currently
                        in use. Please change the role of the following entities
                        first:
                    </Alert>
                    {roleUsers.length ? (
                        <>
                            <StyledLabel>
                                Users ({roleUsers.length}):
                            </StyledLabel>
                            <StyledTableContainer>
                                <RoleDeleteDialogUsers users={roleUsers} />
                            </StyledTableContainer>
                        </>
                    ) : null}
                    {roleServiceAccounts.length ? (
                        <>
                            <StyledLabel>
                                Service accounts ({roleServiceAccounts.length}):
                            </StyledLabel>
                            <StyledTableContainer>
                                <RoleDeleteDialogServiceAccounts
                                    serviceAccounts={roleServiceAccounts}
                                />
                            </StyledTableContainer>
                        </>
                    ) : null}
                    {roleGroups?.length ? (
                        <>
                            <StyledLabel>
                                Groups ({roleGroups?.length}):
                            </StyledLabel>
                            <StyledTableContainer>
                                <RoleDeleteDialogGroups groups={roleGroups!} />
                            </StyledTableContainer>
                        </>
                    ) : null}
                </>
            ) : (
                <p>
                    You are about to delete role: <strong>{role?.name}</strong>
                </p>
            )}
        </Dialogue>
    );
};
