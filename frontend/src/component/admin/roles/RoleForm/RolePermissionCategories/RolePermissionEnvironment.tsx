import { Box, Checkbox, FormControlLabel } from '@mui/material';
import type { ICheckedPermissions, IPermission } from 'interfaces/permissions';
import { getRoleKey } from 'utils/permissions';

interface IEnvironmentPermissionAccordionProps {
    permissions: IPermission[];
    checkedPermissions: ICheckedPermissions;
    onPermissionChange: (permission: IPermission) => void;
}

export const RolePermissionEnvironment = ({
    permissions,
    checkedPermissions,
    onPermissionChange,
}: IEnvironmentPermissionAccordionProps) => {
    return (
        <Box
            display='grid'
            gridTemplateColumns={{
                sm: '1fr 1fr',
                xs: '1fr',
            }}
        >
            {permissions?.map((permission: IPermission) => (
                <FormControlLabel
                    data-testid={getRoleKey(permission)}
                    key={getRoleKey(permission)}
                    control={
                        <Checkbox
                            checked={Boolean(
                                checkedPermissions[getRoleKey(permission)],
                            )}
                            onChange={() => onPermissionChange(permission)}
                            color='primary'
                        />
                    }
                    label={permission.displayName}
                />
            ))}
        </Box>
    );
};
