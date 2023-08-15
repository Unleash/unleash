import { IRole } from 'interfaces/role';
import { RoleDeleteDialogRootRole } from './RoleDeleteDialogRootRole/RoleDeleteDialogRootRole';
import { RoleDeleteDialogProjectRole } from './RoleDeleteDialogProjectRole/RoleDeleteDialogProjectRole';
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
            <RoleDeleteDialogProjectRole
                role={role}
                open={open}
                setOpen={setOpen}
                onConfirm={onConfirm}
            />
        );
    }

    return (
        <RoleDeleteDialogRootRole
            role={role}
            open={open}
            setOpen={setOpen}
            onConfirm={onConfirm}
        />
    );
};
