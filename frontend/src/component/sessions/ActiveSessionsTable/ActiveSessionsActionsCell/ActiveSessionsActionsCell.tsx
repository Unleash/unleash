import Logout from '@mui/icons-material/Logout';
import { Box, styled } from '@mui/material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import type { FC } from 'react';

const StyledBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
}));

interface IActiveSessionsActionsCellProps {
    onRevoke: (event: React.SyntheticEvent) => void;
    current: boolean;
}

export const ActiveSessionsActionsCell: FC<IActiveSessionsActionsCellProps> = ({
    onRevoke,
    current,
}) => {
    return (
        <StyledBox>
            <PermissionIconButton
                data-loading
                onClick={onRevoke}
                permission={ADMIN}
                tooltipProps={{
                    title: current
                        ? 'Revoke session (this is your current session)'
                        : 'Revoke session',
                }}
            >
                <Logout />
            </PermissionIconButton>
        </StyledBox>
    );
};
