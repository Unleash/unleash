import { Alert, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';

const _StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

export type EntityType = 'Users' | 'Groups';

interface IScimDeleteUsersProps {
    open: boolean;
    entityType: EntityType;
    closeDialog: () => void;
    deleteEntities: () => void;
}

export const ScimDeleteEntityDialog = ({
    open,
    closeDialog,
    deleteEntities: removeUser,
    entityType,
}: IScimDeleteUsersProps) => (
    <Dialogue
        open={open}
        primaryButtonText={`Delete SCIM ${entityType}`}
        secondaryButtonText='Cancel'
        title={`Do you really want to delete ALL SCIM ${entityType}?`}
        onClose={closeDialog}
        onClick={removeUser}
    >
        <Typography variant='body1'>
            This will delete all {entityType.toLocaleLowerCase()} created or
            managed by SCIM.
        </Typography>
    </Dialogue>
);
