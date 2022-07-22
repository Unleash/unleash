import React from 'react';
import { ConditionallyRender } from '../../ConditionallyRender/ConditionallyRender';
import { IconButton, Tooltip } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useStyles } from '../ConstraintAccordion.styles';

interface ConstraintAccordionHeaderActionsProps {
    onDelete?: () => void;
    onEdit?: () => void;
    disableEdit?: boolean;
}

export const ConstraintAccordionHeaderActions = ({
    onEdit,
    onDelete,
    disableEdit = false
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
                show={() => (
                    <Tooltip title="Edit constraint" arrow>
                        <IconButton
                            type="button"
                            onClick={onEditClick}
                            disabled={!onEdit}
                        >
                            <Edit />
                        </IconButton>
                    </Tooltip>
                )}
            />
            <ConditionallyRender
                condition={Boolean(onDeleteClick)}
                show={() => (
                    <Tooltip title="Delete constraint" arrow>
                        <IconButton
                            type="button"
                            onClick={onDeleteClick}
                            disabled={!onDelete}
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                )}
            />
        </div>
    );
};
