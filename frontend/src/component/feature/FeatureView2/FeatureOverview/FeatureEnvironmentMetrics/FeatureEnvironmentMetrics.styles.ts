import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        borderRadius: '10px',
        backgroundColor: '#fff',
        padding: '2rem 2rem 2rem 2rem',
        marginBottom: '1rem',
        flexDirection: 'column',
        width: '50%',
        position: 'relative',
    },
    [theme.breakpoints.down(1000)]: {
        container: {
            width: '100%',
        },
    },
    headerContainer: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: theme.fontSizes.subHeader,
        fontWeight: 'normal',
        margin: 0,
    },
    bodyContainer: {
        display: 'flex',
        align: 'items',
        marginTop: '1rem',
        height: '100%',
    },
    trueCountContainer: {
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
    },
    trueCount: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        marginRight: '0.75rem',
        backgroundColor: theme.palette.primary.main,
    },
    falseCount: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        marginRight: '0.75rem',
        backgroundColor: theme.palette.grey[300],
    },
    paragraph: {
        fontSize: theme.fontSizes.smallBody,
    },
    textContainer: {
        marginRight: '1rem',
        maxWidth: '150px',
    },
    primaryMetric: {
        width: '100%',
    },
    icon: {
        fill: theme.palette.grey[300],
        height: '75px',
        width: '75px',
    },
    chartContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}));
