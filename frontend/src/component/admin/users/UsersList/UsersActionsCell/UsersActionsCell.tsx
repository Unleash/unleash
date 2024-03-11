import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Key from '@mui/icons-material/Key';
import Lock from '@mui/icons-material/Lock';
import LockReset from '@mui/icons-material/LockReset';
import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { VFC } from 'react';

const StyledBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
}));

interface IUsersActionsCellProps {
    onEdit: (event: React.SyntheticEvent) => void;
    onViewAccess?: (event: React.SyntheticEvent) => void;
    onChangePassword: (event: React.SyntheticEvent) => void;
    onResetPassword: (event: React.SyntheticEvent) => void;
    onDelete: (event: React.SyntheticEvent) => void;
}

export const UsersActionsCell: VFC<IUsersActionsCellProps> = ({
    onEdit,
    onViewAccess,
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

            <ConditionallyRender
                condition={Boolean(onViewAccess)}
                show={
                    <PermissionIconButton
                        data-loading
                        onClick={onViewAccess!}
                        permission={ADMIN}
                        tooltipProps={{
                            title: 'Access matrix',
                        }}
                    >
                        <Key />
                    </PermissionIconButton>
                }
            />

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
