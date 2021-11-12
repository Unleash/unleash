import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        width: '100%',
        [theme.breakpoints.down(900)]: {
            width: '50%',
        },
        [theme.breakpoints.down(700)]: {
            width: '0%',
        },
    },
    fullWidth: {
        width: '100%',
    },
    environmentsHeader: {
        display: 'flex',
        paddingTop: '1rem',
        justifyContent: 'flex-end',
        position: 'relative',
        alignItems: 'center',
        [theme.breakpoints.down(700)]: {
            padding: '1.5rem',
        },
    },
    outerTabContentContainer: {
        marginTop: '1rem',
        padding: '0rem 2rem 2rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.down(700)]: {
            padding: '0',
        },
    },
    tabContentContainer: {
        display: 'flex',
        position: 'relative',
        justifyContent: 'space-between',
        [theme.breakpoints.down(700)]: {
            padding: '1.5rem',
        },
    },
    listContainerWithoutSidebar: {
        width: '100%',
    },
    listContainer: {
        width: '100%',
        [theme.breakpoints.down(700)]: {
            width: '100%',
        },
    },
    listContainerFullWidth: { width: '100%' },
    containerListView: {
        display: 'none',
        marginTop: 'none',
    },
    header: {
        fontSize: theme.fontSizes.mainHeader,
        fontWeight: 'normal',
    },
    tabContainer: {
        margin: '0rem 2rem 2rem 2rem',
        display: 'flex',
        alignItems: 'center',
    },
    strategyButtonContainer: {
        marginLeft: 'auto',
        marginBottom: '2rem',
    },
    selectStrategy: {
        marginTop: '0',
    },
    configureStrategy: {
        display: 'none',
    },
    addStrategyButton: { marginLeft: 'auto' },
    tabNavigation: {
        backgroundColor: 'transparent',
        textTransform: 'none',
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.grey[400]}`,
        width: '100%',
    },
    tabButton: {
        textTransform: 'none',
        width: 'auto',
    },
}));
