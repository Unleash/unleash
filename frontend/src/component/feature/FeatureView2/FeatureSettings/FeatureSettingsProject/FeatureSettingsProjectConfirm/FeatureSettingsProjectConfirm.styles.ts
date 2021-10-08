import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    compatability: {
        padding: '1rem',
        border: `1px solid ${theme.palette.grey[300]}`,
        marginTop: '1rem',
        display: 'flex',
        alignItems: 'center',
    },
    iconContainer: {
        width: '50px',
        height: '50px',
        backgroundColor: theme.palette.success.main,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorIconContainer: {
        width: '50px',
        height: '50px',
        backgroundColor: theme.palette.error.main,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    check: {
        fill: '#fff',
        width: '30px',
        height: '30px',
    },
    paragraph: {
        marginTop: '1rem',
    },
    cloud: {
        fill: theme.palette.grey[500],
        marginRight: '0.5rem',
    },
}));
