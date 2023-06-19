import { Alert, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import { IRole } from 'interfaces/role';
import { RoleDeleteDialogUsers } from './RoleDeleteDialogUsers/RoleDeleteDialogUsers';
import { RoleDeleteDialogServiceAccounts } from './RoleDeleteDialogServiceAccounts/RoleDeleteDialogServiceAccounts';
import { useGroups } from 'hooks/api/getters/useGroups/useGroups';
import { RoleDeleteDialogGroups } from './RoleDeleteDialogGroups/RoleDeleteDialogGroups';

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
    const { groups } = useGroups();

    const roleUsers = users.filter(({ rootRole }) => rootRole === role?.id);
    const roleServiceAccounts = serviceAccounts.filter(
        ({ rootRole }) => rootRole === role?.id
    );
    const roleGroups = groups?.filter(({ rootRole }) => rootRole === role?.id);

    const entitiesWithRole = Boolean(
        roleUsers.length || roleServiceAccounts.length || roleGroups?.length
    );

    return (
        <Dialogue
            title="Delete role?"
            open={open}
            primaryButtonText="Delete role"
            secondaryButtonText="Cancel"
            disabledPrimaryButton={entitiesWithRole}
            onClick={() => onConfirm(role!)}
            onClose={() => {
                setOpen(false);
            }}
        >
            <ConditionallyRender
                condition={entitiesWithRole}
                show={
                    <>
                        <Alert severity="error">
                            You are not allowed to delete a role that is
                            currently in use. Please change the role of the
                            following entities first:
                        </Alert>
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
                        <ConditionallyRender
                            condition={Boolean(roleGroups?.length)}
                            show={
                                <>
                                    <StyledLabel>
                                        Groups ({roleGroups?.length}):
                                    </StyledLabel>
                                    <StyledTableContainer>
                                        <RoleDeleteDialogGroups
                                            groups={roleGroups!}
                                        />
                                    </StyledTableContainer>
                                </>
                            }
                        />
                    </>
                }
                elseShow={
                    <p>
                        You are about to delete role:{' '}
                        <strong>{role?.name}</strong>
                    </p>
                }
            />
        </Dialogue>
    );
};
