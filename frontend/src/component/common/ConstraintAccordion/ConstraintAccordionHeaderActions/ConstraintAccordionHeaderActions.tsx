import type React from 'react';
import { IconButton, styled, Tooltip } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';

interface ConstraintAccordionHeaderActionsProps {
    onDelete?: () => void;
    onEdit?: () => void;
    disableEdit?: boolean;
    disableDelete?: boolean;
}

const StyledHeaderActions = styled('div')(({ theme }) => ({
    marginLeft: 'auto',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },
}));

export const ConstraintAccordionHeaderActions = ({
    onEdit,
    onDelete,
    disableDelete = false,
    disableEdit = false,
}: ConstraintAccordionHeaderActionsProps) => {
    const onEditClick =
        onEdit &&
        ((event: React.SyntheticEvent) => {
            event.stopPropagation();
            onEdit();
        });

    const onDeleteClick =
        onDelete &&
        ((event: React.SyntheticEvent) => {
            event.stopPropagation();
            onDelete();
        });

    return (
        <StyledHeaderActions>
            {Boolean(onEditClick) && !disableEdit ? (
                <Tooltip title='Edit constraint' arrow>
                    <IconButton
                        type='button'
                        onClick={onEditClick}
                        disabled={disableEdit}
                    >
                        <Edit />
                    </IconButton>
                </Tooltip>
            ) : null}
            {Boolean(onDeleteClick) && !disableDelete ? (
                <Tooltip title='Delete constraint' arrow>
                    <IconButton
                        type='button'
                        onClick={onDeleteClick}
                        disabled={disableDelete}
                    >
                        <Delete />
                    </IconButton>
                </Tooltip>
            ) : null}
        </StyledHeaderActions>
    );
};
