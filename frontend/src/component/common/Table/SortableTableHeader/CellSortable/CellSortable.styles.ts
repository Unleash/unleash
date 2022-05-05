import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tableCellHeaderSortable: {
        padding: 0,
        position: 'relative',
    },
    sortButton: {
        all: 'unset',
        padding: theme.spacing(2),
        fontWeight: theme.fontWeight.medium,
        width: '100%',
        '&:focus-visible, &:active': {
            outline: 'revert',
        },
        display: 'flex',
        alignItems: 'center',
        '&:hover': {
            backgroundColor: theme.palette.grey[400],
        },
        boxSizing: 'inherit',
        cursor: 'pointer',
    },
    sorted: {
        fontWeight: theme.fontWeight.bold,
    },
}));
