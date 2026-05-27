import { Button, styled } from '@mui/material';

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

export const PillButton = styled(Button)(({ theme }) => ({
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    textTransform: 'none',
    fontWeight: theme.typography.body1.fontWeight,
    borderRadius: '4px',
    padding: theme.spacing(1, 2),
    minWidth: theme.spacing(18),
    justifyContent: 'space-between',
    '&:hover': {
        borderColor: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.paper,
    },
    '& .MuiButton-endIcon': {
        marginLeft: 'auto',
    },
}));
