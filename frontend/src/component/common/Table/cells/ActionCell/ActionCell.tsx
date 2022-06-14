import { Box, Divider } from '@mui/material';
import { FC, VFC } from 'react';
import { useStyles } from './ActionCell.styles';

const ActionCellDivider: VFC = () => {
    const { classes } = useStyles();
    return (
        <Divider
            className={classes.divider}
            orientation="vertical"
            variant="middle"
        />
    );
};

const ActionCellComponent: FC & {
    Divider: typeof ActionCellDivider;
} = ({ children }) => {
    const { classes } = useStyles();

    return <Box className={classes.container}>{children}</Box>;
};

ActionCellComponent.Divider = ActionCellDivider;

export const ActionCell = ActionCellComponent;
