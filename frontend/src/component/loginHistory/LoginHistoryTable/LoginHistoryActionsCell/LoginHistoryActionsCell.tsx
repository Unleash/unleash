import { Delete } from '@mui/icons-material';
import { Box, styled } from '@mui/material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';

const StyledBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
}));

interface ILoginHistoryActionsCellProps {
    onDelete: (event: React.SyntheticEvent) => void;
}

export const LoginHistoryActionsCell = ({
    onDelete,
}: ILoginHistoryActionsCellProps) => {
    return (
        <StyledBox>
            <PermissionIconButton
                data-loading
                onClick={onDelete}
                permission={ADMIN}
                tooltipProps={{
                    title: 'Remove event',
                }}
            >
                <Delete />
            </PermissionIconButton>
        </StyledBox>
    );
};
