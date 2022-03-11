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
    header: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        paddingTop: '1.5rem',
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
    },
    disabledIndicatorPos: {
        position: 'absolute',
        top: '15px',
        left: '20px',
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
    linkContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '1rem',
    },
    strategyIconContainer: {
        minWidth: '40px',
        marginRight: '5px',
        display: 'flex',
        justifyContent: 'center',
    },
    strategiesIconsContainer: {
        transform: 'scale(0.8)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        [theme.breakpoints.down(560)]: {
            marginLeft: '0px',
            top: '5px',
        },
    },
    [theme.breakpoints.down(560)]: {
        disabledIndicatorPos: {
            top: '13px',
        },
        headerTitle: {
            flexDirection: 'column',
            textAlign: 'center',
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
    strategyIcon: {
        fill: theme.palette.grey[600],
    },
    container: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: '1.8rem',
        [theme.breakpoints.down(560)]: {
            flexDirection: 'column',
            marginLeft: '0',
        },
    },
    strategyMenu: {
        marginRight: '-.5rem',
    },
}));
