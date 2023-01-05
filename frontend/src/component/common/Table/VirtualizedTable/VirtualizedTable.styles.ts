import { styled, TableCell, TableRow } from '@mui/material';

export const StyledRow = styled(TableRow)({
    position: 'absolute',
    width: '100%',
    '&:hover': {
        '.show-row-hover': {
            opacity: 1,
        },
    },
});

export const StyledCell = styled(TableCell)({
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    '& > *': {
        flexGrow: 1,
    },
});
