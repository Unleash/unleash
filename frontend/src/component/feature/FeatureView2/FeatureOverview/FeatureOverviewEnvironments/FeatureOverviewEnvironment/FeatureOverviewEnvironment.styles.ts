import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    featureOverviewEnvironment: {
        borderRadius: '12.5px',
        padding: '0.2rem',
        marginBottom: '1rem',
        backgroundColor: '#fff',
    },
    accordionContainer: {
        width: '100%',
    },
    accordionHeader: {
        boxShadow: 'none',
        padding: '1rem 2rem',
    },
    accordionBody: {
        width: '100%',
        position: 'relative',
        paddingBottom: '1rem',
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: theme.palette.primary.light,
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '0.5rem',
    },
    icon: {
        fill: '#fff',
        width: '17px',
        height: '17px',
    },
    resultInfo: {
        display: 'flex',
        alignItems: 'center',
        margin: '1rem 0',
    },
    leftWing: {
        height: '2px',
        backgroundColor: theme.palette.grey[300],
        width: '90%',
    },
    separatorText: {
        fontSize: theme.fontSizes.smallBody,
        padding: '0 1rem',
    },
    rightWing: {
        height: '2px',
        backgroundColor: theme.palette.grey[300],
        width: '90%',
    },
    accordionBodyFooter: {
        position: 'relative',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentageContainer: {
        width: '50px',
        height: '50px',
        border: `2px solid ${theme.palette.primary.light}`,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        color: theme.palette.primary.light,
        marginTop: '1rem',
    },
    requestContainer: {
        padding: '2rem',
        border: `2px solid ${theme.palette.primary.light}`,
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '300px',
        justifyContent: 'center',
        minWidth: '200px',
        alignItems: 'center',
    },
    requestText: {
        textAlign: 'center',
        marginTop: '1rem',
    },
    linkContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '1rem',
    },
    disabledInfo: {
        maxWidth: '300px',
        marginRight: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    disabledIcon: {
        height: '50px',
        width: '50px',
        fill: theme.palette.grey[400],
        marginBottom: '1rem',
    },
    [theme.breakpoints.down(750)]: {
        accordionBodyFooter: {
            flexDirection: 'column',
        },
        requestContainer: {
            marginTop: '1rem',
        },
    },
    [theme.breakpoints.down(560)]: {
        headerTitle: {
            flexDirection: 'column',
        },
        headerIcon: {
            marginBottom: '0.5rem',
        },
        truncator: {
            textAlign: 'center',
        },
    },
    [theme.breakpoints.down(400)]: {
        accordionHeader: {
            padding: '0.5rem 1rem',
        },

        accordionBodyInnerContainer: {
            padding: '0.5rem',
        },
    },
}));
