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
    accordionBodyFooter: {
        position: 'relative',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentageContainer: {
        width: '90px',
        height: '90px',
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
        fontSize: theme.fontSizes.smallBody,
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
    strategiesText: {
        fontSize: '14px',
        color: theme.palette.grey[700],
    },
    stratigiesInfoContainer: {
        display: 'flex',
    },
    noStratigiesInfoContainer: {
        top: '1px',
        position: 'relative',
    },
    stratigiesIconsContainer: {
        display: 'flex',
        alignItems: 'center',
        transform: 'scale(0.8)',
        top: '3px',
        left: '-10px',
        position: 'relative',
        [theme.breakpoints.down(560)]: {
            marginLeft: '0px',
            top: '5px',
        },
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
        disabledIndicatorPos: {
            top: '13px',
        },
        headerTitle: {
            flexDirection: 'column',
        },
        headerIcon: {
            marginBottom: '0.5rem',
        },
        truncator: {
            textAlign: 'center',
        },
        resultContainer: {
            flexWrap: 'wrap',
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
    strategyIconContainer: {
        marginRight: '5px',
    },
    strategyIcon: {
        fill: theme.palette.grey[600],
    },
    container: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: '1.3rem',
        [theme.breakpoints.down(560)]: {
            flexDirection: 'column',
            marginLeft: '0',
        },
    },
    addStrategyButton: {
        background: 'none',
        textDecoration: 'none',
        boxShadow: 'none',
        color: theme.palette.primary.main,
        fontWeight: 'normal',
        '&:hover': {
            background: 'none',
            textDecoration: 'none',
            boxShadow: 'none',
            color: theme.palette.primary.main,
            fontWeight: 'normal',
        },
        '&:disabled': {
            margin: '0px 16px',
            height: '35px'
         },
    },
    separtor: {
        marginLeft: '-10px',
        marginRight: '9px',
        [theme.breakpoints.down(560)]: {
            display: 'none',
        },
    },
    resultContainer: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-around',
    },
    dataContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        padding: '0px 15px',
    },
    resultTitle: {
        color: theme.palette.primary.main,
    },
}));
