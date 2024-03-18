import type React from 'react';
import { IconButton, styled, Tooltip } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Undo from '@mui/icons-material/Undo';
import { ConditionallyRender } from '../../ConditionallyRender/ConditionallyRender';
import type { IConstraint } from 'interfaces/strategy';

interface ConstraintAccordionHeaderActionsProps {
    onDelete?: () => void;
    onEdit?: () => void;
    onUndo?: () => void;
    constraintChanges?: IConstraint[];
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
    onUndo,
    constraintChanges = [],
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

    const onUndoClick =
        onUndo &&
        ((event: React.SyntheticEvent) => {
            event.stopPropagation();
            onUndo();
        });

    return (
        <StyledHeaderActions>
            <ConditionallyRender
                condition={Boolean(onEditClick) && !disableEdit}
                show={
                    <Tooltip title='Edit constraint' arrow>
                        <IconButton
                            type='button'
                            onClick={onEditClick}
                            disabled={disableEdit}
                            data-testid='EDIT_CONSTRAINT_BUTTON'
                        >
                            <Edit />
                        </IconButton>
                    </Tooltip>
                }
            />
            <ConditionallyRender
                condition={Boolean(onUndoClick) && constraintChanges.length > 1}
                show={
                    <Tooltip title='Undo last change' arrow>
                        <IconButton
                            type='button'
                            onClick={onUndoClick}
                            disabled={disableDelete}
                            data-testid='UNDO_CONSTRAINT_CHANGE_BUTTON'
                        >
                            <Undo />
                        </IconButton>
                    </Tooltip>
                }
            />
            <ConditionallyRender
                condition={Boolean(onDeleteClick) && !disableDelete}
                show={
                    <Tooltip title='Delete constraint' arrow>
                        <IconButton
                            type='button'
                            onClick={onDeleteClick}
                            disabled={disableDelete}
                            data-testid='DELETE_CONSTRAINT_BUTTON'
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                }
            />
        </StyledHeaderActions>
    );
};
