import { FC } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { useStyles } from './TextCell.styles';

interface ITextCellProps {
    value?: string | null;
    lineClamp?: number;
    'data-testid'?: string;
    sx?: SxProps<Theme>;
}

export const TextCell: FC<ITextCellProps> = ({
    value,
    children,
    lineClamp,
    sx,
    'data-testid': testid,
}) => {
    const { classes } = useStyles({ lineClamp });

    return (
        <Box className={classes.wrapper} sx={sx}>
            <span data-loading="true" data-testid={testid}>
                {children ?? value}
            </span>
        </Box>
    );
};
