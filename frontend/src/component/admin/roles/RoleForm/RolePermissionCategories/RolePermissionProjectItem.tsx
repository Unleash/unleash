import {
    Box,
    Checkbox,
    FormControlLabel,
    styled,
    Typography,
} from '@mui/material';
import type { IPermission } from 'interfaces/permissions';

type RolePermissionProjectItemProps = {
    permission: IPermission;
    onChange: () => void;
    isChecked: boolean;
    hasParentPermission?: boolean;
    isParentPermissionChecked?: boolean;
};

const StyledLabel = styled(Typography)(({ theme }) => ({
    lineHeight: 1.2,
    marginBottom: theme.spacing(1),
}));

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
            label={<StyledLabel>{permission.displayName}</StyledLabel>}
        />
    </Box>
);
