import { makeStyles } from 'tss-react/mui';
import { unleashGrey } from 'themes/themeColors';

export const useStyles = makeStyles()(theme => ({
    tableCellHeaderSortable: {
        padding: 0,
        position: 'relative',
        cursor: 'pointer',
        '& > svg': {
            fontSize: 18,
            verticalAlign: 'middle',
            color: unleashGrey[700],
            marginLeft: '4px',
        },
        '&.sorted': {
            fontWeight: 'bold',
            '& > svg': {
                color: unleashGrey[900],
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
            backgroundColor: unleashGrey[400],
            '& > svg': {
                color: unleashGrey[900],
            },
        },
    },
    icon: {
        marginLeft: theme.spacing(0.5),
        fontSize: 18,
    },
}));
