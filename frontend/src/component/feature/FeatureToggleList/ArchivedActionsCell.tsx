import { styled } from '@mui/material';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';

const StyledActions = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing(1),
    padding: theme.spacing(0, 2),
}));

interface IArchivedActionsCellProps {
    projectId: string;
    onRevive: () => void;
    onDelete: () => void;
}

export const ArchivedActionsCell = ({
    projectId,
    onRevive,
    onDelete,
}: IArchivedActionsCellProps) => (
    <StyledActions>
        <PermissionButton
            variant='text'
            size='medium'
            permission={UPDATE_FEATURE}
            projectId={projectId}
            onClick={onRevive}
        >
            Revive
        </PermissionButton>
        <PermissionButton
            variant='text'
            size='medium'
            permission={DELETE_FEATURE}
            projectId={projectId}
            onClick={onDelete}
        >
            Delete
        </PermissionButton>
    </StyledActions>
);
