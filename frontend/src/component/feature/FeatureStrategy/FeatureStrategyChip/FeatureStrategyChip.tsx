import Clear from '@mui/icons-material/Clear';
import { Chip, type ChipProps, styled } from '@mui/material';
import type { SystemStyleObject, Theme } from '@mui/system';
import { forwardRef } from 'react';

interface IFeatureStrategyChipProps extends ChipProps {
    labelSx?: SystemStyleObject<Theme>;
}

const DeleteIcon = styled(Clear)(({ theme }) => ({
    fill: theme.palette.primary.onContainer,
    borderRadius: '50%',
    outline: '2px solid transparent',
    transition: 'inherit',
    ':focus-visible, :hover': {
        backgroundColor: theme.palette.table.headerHover,
        outlineColor: theme.palette.table.headerHover,
    },
    '&.MuiChip-deleteIcon': {
        marginRight: theme.spacing(1),
    },
}));

export const FeatureStrategyChip = styled(
    forwardRef<HTMLDivElement, IFeatureStrategyChipProps>(
        ({ labelSx, ...props }, ref) => (
            <Chip
                size='small'
                deleteIcon={<DeleteIcon />}
                {...props}
                ref={ref}
                slotProps={{
                    label: {
                        sx: (theme) => ({
                            paddingTop: theme.spacing(0.5),
                            paddingBottom: theme.spacing(0.5),
                            paddingLeft: theme.spacing(1.5),
                            ...labelSx,
                        }),
                    },
                }}
            />
        ),
    ),
)(({ theme }) => ({
    background: theme.palette.background.elevation1,
    color: theme.palette.text.primary,
    height: '30px',
    padding: 0,
    outline: '1px solid transparent',
    transition: 'all 0.3s ease',
    ':focus-visible': {
        background: theme.palette.background.elevation1,
        outlineColor: theme.palette.primary.onContainer,
    },
    '&.MuiChip-clickable:hover': {
        background: theme.palette.primary.container,
    },
}));
