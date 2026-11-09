import Clear from '@mui/icons-material/Clear';
import { Chip, type ChipProps, styled, type Theme } from '@mui/material';
import { forwardRef } from 'react';

const baseChipStyles = (theme: Theme) => ({
    ':hover': { background: theme.palette.primary.container },
    ':focus-visible': {
        background: theme.palette.background.elevation1,
        outlineColor: theme.palette.primary.onContainer,
    },
    background: theme.palette.background.elevation1,
    color: theme.palette.text.primary,
    height: 'auto',
    outline: `1px solid #0000`,
    transition: 'all 0.3s ease',
});

export const ValueChip = styled(
    forwardRef<HTMLDivElement, ChipProps>((props, ref) => (
        <Chip size='small' {...props} ref={ref} deleteIcon={<Clear />} />
    )),
)(({ theme }) => ({
    ...baseChipStyles(theme),
    color: theme.palette.text.primary,
    padding: 0,
    height: 'auto',
    '& .MuiChip-label': {
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        paddingLeft: theme.spacing(1.5),
    },
    '& .MuiChip-deleteIcon': {
        marginRight: theme.spacing(1),
    },
    svg: {
        fill: theme.palette.primary.onContainer,
        borderRadius: '50%',
        outline: `2px solid #0000`,
        transition: 'inherit',
        ':focus-visible,:hover': {
            backgroundColor: theme.palette.table.headerHover,
            outlineColor: theme.palette.table.headerHover,
        },
    },
}));
