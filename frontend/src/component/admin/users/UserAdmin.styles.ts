import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    userListBody: {
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
