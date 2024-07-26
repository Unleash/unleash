import { Popover, styled } from '@mui/material';

export const StyledDropdown = styled('div')(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    maxHeight: '70vh',
}));

export const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
    },
}));

export const ButtonLabel = styled('span', {
    shouldForwardProp: (prop) => prop !== 'labelWidth',
})<{ labelWidth?: string }>(({ labelWidth, theme }) => ({
    width: labelWidth || 'unset',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
        width: 'max-content',
    },
}));

export const StyledTooltipContent = styled('article')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    paddingBlock: theme.spacing(1),

    '& > *': {
        margin: 0,
    },
}));
