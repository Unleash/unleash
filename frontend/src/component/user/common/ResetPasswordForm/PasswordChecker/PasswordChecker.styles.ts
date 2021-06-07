import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        border: '1px solid #f1f1f1',
        borderRadius: '3px',
        position: 'relative',
        maxWidth: '350px',
        color: '#44606e',
    },
    headerContainer: { display: 'flex', padding: '0.5rem' },
    divider: {
        backgroundColor: theme.palette.borders?.main,
        height: '1px',
        width: '100%',
    },
    checkContainer: {
        width: '95px',
        margin: '0 0.25rem',
        display: 'flex',
        justifyContent: 'center',
    },
    statusBarContainer: {
        display: 'flex',
        padding: '0.5rem',
    },
    statusBar: {
        width: '50px',
        borderRadius: '3px',
        backgroundColor: 'red',
        height: '6px',
    },
    title: {
        marginBottom: '0',
        display: 'flex',
        alignItems: 'center',
    },
    statusBarSuccess: {
        backgroundColor: theme.palette.primary.main,
    },
    helpIcon: {
        height: '17.5px',
    },
    repeatingError: {
        marginTop: '0.5rem',
        bottom: '0',
        position: 'absolute',
    },
}));
