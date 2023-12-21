import { Delete, Edit, Lock, LockReset } from '@mui/icons-material';
import { Box, styled } from '@mui/material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { VFC } from 'react';

const StyledBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
}));

interface IUsersActionsCellProps {
    onEdit: (event: React.SyntheticEvent) => void;
    onChangePassword: (event: React.SyntheticEvent) => void;
    onResetPassword: (event: React.SyntheticEvent) => void;
    onDelete: (event: React.SyntheticEvent) => void;
}

export const UsersActionsCell: VFC<IUsersActionsCellProps> = ({
    onEdit,
    onChangePassword,
    onResetPassword,
    onDelete,
}) => {
    return (
        <StyledBox>
            <PermissionIconButton
                data-loading
                onClick={onEdit}
                permission={ADMIN}
                tooltipProps={{
                    title: 'Edit user',
                }}
            >
                <Edit />
            </PermissionIconButton>
            <PermissionIconButton
                data-loading
                onClick={onChangePassword}
                permission={ADMIN}
                tooltipProps={{
                    title: 'Change password',
                }}
            >
                <Lock />
            </PermissionIconButton>
            <PermissionIconButton
                data-loading
                onClick={onResetPassword}
                permission={ADMIN}
                tooltipProps={{
                    title: 'Reset password',
                }}
            >
                <LockReset />
            </PermissionIconButton>
            <PermissionIconButton
                data-loading
                onClick={onDelete}
                permission={ADMIN}
                tooltipProps={{
                    title: 'Remove user',
                }}
            >
                <Delete />
            </PermissionIconButton>
        </StyledBox>
    );
};
