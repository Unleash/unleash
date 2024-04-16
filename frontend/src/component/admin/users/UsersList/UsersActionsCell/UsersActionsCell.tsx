import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Key from '@mui/icons-material/Key';
import Lock from '@mui/icons-material/Lock';
import LockReset from '@mui/icons-material/LockReset';
import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import type { VFC } from 'react';

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
    scimEnabled?: boolean;
}

export const UsersActionsCell: VFC<IUsersActionsCellProps> = ({
    onEdit,
    onViewAccess,
    onChangePassword,
    onResetPassword,
    onDelete,
    scimEnabled,
}) => {
    const scimTooltip =
        'This user is managed by your SCIM provider and cannot be changed manually';

    return (
        <StyledBox>
            <PermissionIconButton
                data-loading
                onClick={onEdit}
                permission={ADMIN}
                tooltipProps={{
                    title: scimEnabled ? scimTooltip : 'Edit user',
                }}
                disabled={scimEnabled}
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
                    title: scimEnabled ? scimTooltip : 'Change password',
                }}
                disabled={scimEnabled}
            >
                <Lock />
            </PermissionIconButton>
            <PermissionIconButton
                data-loading
                onClick={onResetPassword}
                permission={ADMIN}
                tooltipProps={{
                    title: scimEnabled ? scimTooltip : 'Reset password',
                }}
                disabled={scimEnabled}
            >
                <LockReset />
            </PermissionIconButton>
            <PermissionIconButton
                data-loading
                onClick={onDelete}
                permission={ADMIN}
                tooltipProps={{
                    title: scimEnabled ? scimTooltip : 'Remove user',
                }}
                disabled={scimEnabled}
            >
                <Delete />
            </PermissionIconButton>
        </StyledBox>
    );
};
