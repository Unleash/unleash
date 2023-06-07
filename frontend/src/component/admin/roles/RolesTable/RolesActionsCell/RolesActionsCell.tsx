import { Delete, Edit } from '@mui/icons-material';
import { Box, styled } from '@mui/material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import IRole from 'interfaces/role';
import { VFC } from 'react';

const StyledBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
}));

const DEFAULT_ROOT_ROLE = 'root';

interface IRolesActionsCellProps {
    role: IRole;
    onEdit: (event: React.SyntheticEvent) => void;
    onDelete: (event: React.SyntheticEvent) => void;
}

export const RolesActionsCell: VFC<IRolesActionsCellProps> = ({
    role,
    onEdit,
    onDelete,
}) => {
    const defaultRole = role.type === DEFAULT_ROOT_ROLE;

    return (
        <StyledBox>
            <PermissionIconButton
                data-loading
                onClick={onEdit}
                permission={ADMIN}
                disabled={defaultRole}
                tooltipProps={{
                    title: defaultRole
                        ? 'You cannot edit a predefined role'
                        : 'Edit role',
                }}
            >
                <Edit />
            </PermissionIconButton>
            <PermissionIconButton
                data-loading
                onClick={onDelete}
                permission={ADMIN}
                disabled={defaultRole}
                tooltipProps={{
                    title: defaultRole
                        ? 'You cannot remove a predefined role'
                        : 'Remove role',
                }}
            >
                <Delete />
            </PermissionIconButton>
        </StyledBox>
    );
};
