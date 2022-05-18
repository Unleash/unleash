import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    userListBody: {
        padding: theme.spacing(4),
        paddingBottom: '4rem',
        minHeight: '50vh',
        position: 'relative',
    },
    tableActions: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        '&>button': {
            flexShrink: 0,
        },
    },
}));
