import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        height: '100%',
        width: '100%',
        position: 'relative',
        transition: 'background-color 0.4s ease',
    },
    isOver: {
        backgroundColor: theme.palette.primary.light,
        opacity: '0.75',
    },
    dropbox: {
        textAlign: 'center',
        fontSize: theme.fontSizes.smallBody,
        padding: '1rem',
        border: `2px dotted ${theme.palette.primary.light}`,
        borderRadius: '3px',
        transition: 'background-color 0.4s ease',
        marginTop: '1rem',
    },
    dropboxActive: {
        border: `2px dotted #fff`,
        color: '#fff',
        transition: 'color 0.4s ease',
    },
    dropIcon: {
        fill: theme.palette.primary.light,
        marginTop: '0.5rem',
        height: '40px',
        width: '40px',
    },
    dropIconActive: {
        fill: '#fff',
        transition: 'color 0.4s ease',
    },
    environmentList: {
        marginTop: 0,
        marginBottom: 0,
    },
    headerContainer: {
        position: 'absolute',
        top: '-65px',
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        [theme.breakpoints.down(700)]: {
            top: '-94px',
        },
    },
}));
