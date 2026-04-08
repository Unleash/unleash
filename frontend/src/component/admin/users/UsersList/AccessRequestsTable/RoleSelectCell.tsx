import { Select, MenuItem, styled } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import type { IRole } from 'interfaces/role';

const StyledSelect = styled(Select<number>)(({ theme }) => ({
    minWidth: 100,
    height: 32,
    fontSize: theme.fontSizes.smallBody,
}));

interface IRoleSelectCellProps {
    roles: IRole[];
    selectedRoleId: number;
    onChange: (roleId: number) => void;
}

export const RoleSelectCell = ({
    roles,
    selectedRoleId,
    onChange,
}: IRoleSelectCellProps) => (
    <TextCell>
        <StyledSelect
            size='small'
            value={selectedRoleId}
            onChange={(e) => onChange(e.target.value as number)}
            variant='outlined'
        >
            {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                    {role.name}
                </MenuItem>
            ))}
        </StyledSelect>
    </TextCell>
);
