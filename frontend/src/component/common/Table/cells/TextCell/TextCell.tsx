import { FC } from 'react';
import { Box } from '@mui/material';
import { useStyles } from './TextCell.styles';

interface ITextCellProps {
    value?: string | null;
    lineClamp?: number;
}

export const TextCell: FC<ITextCellProps> = ({
    value,
    children,
    lineClamp,
}) => {
    const { classes } = useStyles({ lineClamp });

    return (
        <Box className={classes.wrapper}>
            <span data-loading>{children ?? value}</span>
        </Box>
    );
};
