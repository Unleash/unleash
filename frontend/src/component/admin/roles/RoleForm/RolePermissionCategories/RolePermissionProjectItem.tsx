import { Box, Checkbox, FormControlLabel } from '@mui/material';
import type { IPermission } from 'interfaces/permissions';

type RolePermissionProjectItemProps = {
    permission: IPermission;
    onChange: () => void;
    isChecked: boolean;
    hasParentPermission?: boolean;
    isParentPermissionChecked?: boolean;
};

export const RolePermissionProjectItem = ({
    permission,
    onChange,
    isChecked,
    hasParentPermission,
    isParentPermissionChecked,
}: RolePermissionProjectItemProps) => (
    <Box
        sx={(theme) => ({
            marginLeft: hasParentPermission ? theme.spacing(1.5) : 0,
        })}
    >
        <FormControlLabel
            data-testid={permission}
            key={permission.name}
            control={
                <Checkbox
                    checked={Boolean(isChecked || isParentPermissionChecked)}
                    onChange={onChange}
                    color='primary'
                    disabled={isParentPermissionChecked}
                />
            }
            label={permission.displayName}
        />
    </Box>
);
