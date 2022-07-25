import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useStyles } from '../ConstraintAccordion.styles';
import { ConditionallyRender } from '../../ConditionallyRender/ConditionallyRender';

interface ConstraintAccordionHeaderActionsProps {
    onDelete?: () => void;
    onEdit?: () => void;
    disableEdit?: boolean;
    disableDelete?: boolean;
}

export const ConstraintAccordionHeaderActions = ({
    onEdit,
    onDelete,
    disableDelete = false,
    disableEdit = false,
}: ConstraintAccordionHeaderActionsProps) => {
    const { classes: styles } = useStyles();
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
        <div className={styles.headerActions}>
            <ConditionallyRender
                condition={Boolean(onEditClick) && !disableEdit}
                show={
                    <Tooltip title="Edit constraint" arrow>
                        <IconButton
                            type="button"
                            onClick={onEditClick}
                            disabled={disableEdit}
                        >
                            <Edit />
                        </IconButton>
                    </Tooltip>
                }
            />
            <ConditionallyRender
                condition={Boolean(onDeleteClick) && !disableDelete}
                show={
                    <Tooltip title="Delete constraint" arrow>
                        <IconButton
                            type="button"
                            onClick={onDeleteClick}
                            disabled={disableDelete}
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                }
            />
        </div>
    );
};
