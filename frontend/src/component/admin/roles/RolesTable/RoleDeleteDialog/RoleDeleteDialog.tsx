import { IRole } from 'interfaces/role';
import { RoleDeleteDialogRootRoles } from './RoleDeleteDialogRootRoles/RoleDeleteDialogRootRoles';
import { RoleDeleteDialogProjectRoles } from './RoleDeleteDialogProjectRoles/RoleDeleteDialogProjectRoles';

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
    if (role?.type === 'custom') {
        return (
            <RoleDeleteDialogProjectRoles role={role} open={open} setOpen={setOpen} onConfirm={onConfirm} />
        );
    }

    return (
        <RoleDeleteDialogRootRoles role={role} open={open} setOpen={setOpen} onConfirm={onConfirm} />
    );
};
