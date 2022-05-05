import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tableCellHeaderSortable: {
        padding: 0,
        cursor: 'pointer',
        '& > svg': {
            fontSize: 18,
            verticalAlign: 'middle',
            color: theme.palette.grey[700],
            marginLeft: '4px',
        },
        '&.sorted': {
            fontWeight: 'bold',
            '& > svg': {
                color: theme.palette.grey[900],
            },
        },
    },
    sortButton: {
        all: 'unset',
        padding: theme.spacing(2),
        width: '100%',
        '&:focus-visible, &:active': {
            outline: 'revert',
        },
        display: 'flex',
        alignItems: 'center',
        '&:hover': {
            backgroundColor: theme.palette.grey[400],
            '& > svg': {
                color: theme.palette.grey[900],
            },
        },
    },
    icon: {
        marginLeft: theme.spacing(0.5),
        fontSize: 18,
    },
}));
