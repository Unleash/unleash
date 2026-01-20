import { Box, styled } from '@mui/material';

const CountBadge = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.secondary,
    padding: theme.spacing(0, 0.5),
    minWidth: '1.5em',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    variant: 'outlined',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(-0.5),
    fontWeight: 'bold',
    '&[data-selected="true"]': {
        backgroundColor: theme.palette.secondary.light,
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
    },
}));

export const FlagsCountBadge = ({
    count,
    isActive,
}: {
    count: number;
    isActive?: boolean;
}) => <CountBadge data-selected={isActive}>{count}</CountBadge>;
