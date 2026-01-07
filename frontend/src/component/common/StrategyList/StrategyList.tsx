import { styled } from '@mui/material';

export const StrategyList = styled('ol')(({ theme }) => ({
    listStyle: 'none',
    padding: 0,
    margin: 0,

    '& > li': {
        paddingBlock: theme.spacing(2.5),
        position: 'relative',
    },
    '& > li + li': {
        borderTop: `1px solid ${theme.palette.divider}`,
    },
    '& > li:first-of-type': {
        paddingTop: theme.spacing(1),
    },
}));
