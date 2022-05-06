import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tableCellHeaderSortable: {
        padding: 0,
        position: 'relative',
        '&:hover, &:focus': {
            backgroundColor: theme.palette.grey[400],
        },
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
        boxSizing: 'inherit',
        cursor: 'pointer',
    },
    sorted: {
        fontWeight: theme.fontWeight.bold,
    },
}));
