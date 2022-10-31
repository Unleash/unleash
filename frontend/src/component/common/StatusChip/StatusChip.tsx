import { FC, ReactElement } from 'react';
import { Chip, styled } from '@mui/material';
import { colors } from 'themes/colors';

interface IResultChipProps {
    label: string;
    variant?: 'true' | 'false' | 'undefined';
    icon?: ReactElement;
}

export const StyledChip = styled(Chip)(({ theme, icon }) => ({
    padding: theme.spacing(0, 1),
    height: 24,
    borderRadius: theme.shape.borderRadius,
    fontWeight: theme.typography.fontWeightMedium,
    ['& .MuiChip-label']: {
        padding: 0,
        paddingLeft: Boolean(icon) ? theme.spacing(0.5) : 0,
    },
}));

export const StyledFalseChip = styled(StyledChip)(({ theme }) => ({
    border: `1px solid ${theme.palette.error.main}`,
    backgroundColor: colors.red['200'],
    ['& .MuiChip-label']: {
        color: theme.palette.error.main,
    },
    ['& .MuiChip-icon']: {
        color: theme.palette.error.main,
    },
}));

export const StyledTrueChip = styled(StyledChip)(({ theme }) => ({
    border: `1px solid ${theme.palette.success.main}`,
    backgroundColor: colors.green['100'],
    ['& .MuiChip-label']: {
        color: theme.palette.success.main,
    },
    ['& .MuiChip-icon']: {
        color: theme.palette.success.main,
        marginRight: 0,
    },
}));

export const StyledUnknownChip = styled(StyledChip)(({ theme }) => ({
    border: `1px solid ${theme.palette.warning.main}`,
    backgroundColor: colors.orange['100'],
    ['& .MuiChip-label']: {
        color: theme.palette.warning.main,
    },
    ['& .MuiChip-icon']: {
        color: theme.palette.warning.main,
    },
}));

export const StatusChip: FC<IResultChipProps> = ({
    label,
    icon,
    variant = 'undefined',
}) => {
    if (variant === 'true') {
        return <StyledTrueChip icon={icon} label={label} variant="outlined" />;
    }
    if (variant === 'false') {
        return <StyledFalseChip icon={icon} label={label} variant="outlined" />;
    }
    return <StyledUnknownChip icon={icon} label={label} variant="outlined" />;
};
