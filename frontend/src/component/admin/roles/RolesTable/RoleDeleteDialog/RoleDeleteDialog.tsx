import { IRole } from 'interfaces/role';
import { RoleDeleteDialogRootRoles } from './RoleDeleteDialogRootRoles/RoleDeleteDialogRootRoles';
import { RoleDeleteDialogProjectRoles } from './RoleDeleteDialogProjectRole/RoleDeleteDialogProjectRole';
import { CUSTOM_PROJECT_ROLE_TYPE } from 'constants/roles';

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
    if (role?.type === CUSTOM_PROJECT_ROLE_TYPE) {
        return (
            <RoleDeleteDialogProjectRoles
                role={role}
                open={open}
                setOpen={setOpen}
                onConfirm={onConfirm}
            />
        );
    }

    return (
        <RoleDeleteDialogRootRoles
            role={role}
            open={open}
            setOpen={setOpen}
            onConfirm={onConfirm}
        />
    );
};
