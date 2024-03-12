import type React from 'react';
import type { VFC } from 'react';
import { Box, styled } from '@mui/material';
import PermissionIconButton from '../../../../common/PermissionIconButton/PermissionIconButton';
import { ADMIN } from '../../../../providers/AccessProvider/permissions';
import Delete from '@mui/icons-material/Delete';

const StyledBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
}));
interface IInactiveUsersActionsCellProps {
    onDelete: (event: React.SyntheticEvent) => void;
}

export const InactiveUsersActionCell: VFC<IInactiveUsersActionsCellProps> = ({
    onDelete,
}) => {
    return (
        <StyledBox>
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
