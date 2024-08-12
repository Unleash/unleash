import { Alert, styled } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { IRole } from 'interfaces/role';
import { useProjectRoleAccessUsage } from 'hooks/api/getters/useProjectRoleAccessUsage/useProjectRoleAccessUsage';
import { RoleDeleteDialogProjectRoleTable } from './RoleDeleteDialogProjectRoleTable';

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

export const RoleDeleteDialogProjectRole = ({
    role,
    open,
    setOpen,
    onConfirm,
}: IRoleDeleteDialogProps) => {
    const { projects } = useProjectRoleAccessUsage(role?.id);

    const entitiesWithRole = Boolean(projects?.length);

    return (
        <Dialogue
            title='Delete project role?'
            open={open}
            primaryButtonText='Delete role'
            secondaryButtonText='Cancel'
            disabledPrimaryButton={entitiesWithRole}
            onClick={() => onConfirm(role!)}
            onClose={() => {
                setOpen(false);
            }}
            maxWidth='md'
        >
            {entitiesWithRole ? (
                <>
                    <Alert severity='error'>
                        You are not allowed to delete a role that is currently
                        in use. Please change the role of the following entities
                        first:
                    </Alert>
                    {projects?.length ? (
                        <>
                            <StyledLabel>
                                Role assigned in {projects?.length} projects:
                            </StyledLabel>
                            <StyledTableContainer>
                                <RoleDeleteDialogProjectRoleTable
                                    projects={projects}
                                />
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
