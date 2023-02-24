import { Delete } from '@mui/icons-material';
import { Box, styled } from '@mui/material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';

const StyledBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
}));

interface ISignOnLogActionsCellProps {
    onDelete: (event: React.SyntheticEvent) => void;
}

export const SignOnLogActionsCell = ({
    onDelete,
}: ISignOnLogActionsCellProps) => {
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
