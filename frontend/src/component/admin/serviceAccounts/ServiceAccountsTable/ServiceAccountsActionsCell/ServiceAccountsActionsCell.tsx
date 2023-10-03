import { Delete, Edit } from '@mui/icons-material';
import { Box, styled } from '@mui/material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { VFC } from 'react';

const StyledBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
}));

interface IServiceAccountsActionsCellProps {
    onEdit: (event: React.SyntheticEvent) => void;
    onDelete: (event: React.SyntheticEvent) => void;
}

export const ServiceAccountsActionsCell: VFC<
    IServiceAccountsActionsCellProps
> = ({ onEdit, onDelete }) => {
    return (
        <StyledBox>
            <PermissionIconButton
                data-loading
                onClick={onEdit}
                permission={ADMIN}
                tooltipProps={{
                    title: 'Edit service account',
                }}
            >
                <Edit />
            </PermissionIconButton>
            <PermissionIconButton
                data-loading
                onClick={onDelete}
                permission={ADMIN}
                tooltipProps={{
                    title: 'Remove service account',
                }}
            >
                <Delete />
            </PermissionIconButton>
        </StyledBox>
    );
};
