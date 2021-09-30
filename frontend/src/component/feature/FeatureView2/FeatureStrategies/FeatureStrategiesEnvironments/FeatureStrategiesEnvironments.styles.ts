import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        width: '70%',
        [theme.breakpoints.down(900)]: {
            width: '50%',
        },
        [theme.breakpoints.down(700)]: {
            width: '0%',
        },
    },
    fullWidth: {
        width: '90%',
        [theme.breakpoints.down(700)]: {
            width: '85%',
        },
    },
    environmentsHeader: {
        padding: '2rem 2rem 1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        [theme.breakpoints.down(700)]: {
            padding: '1.5rem',
        },
    },
    tabContentContainer: {
        padding: '1rem 2rem 2rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        [theme.breakpoints.down(700)]: {
            padding: '1.5rem',
        },
    },
    listContainerWithoutSidebar: {
        width: '100%',
    },
    listContainer: {
        width: '70%',
        [theme.breakpoints.down(700)]: {
            width: '100%',
        },
    },
    listContainerFullWidth: { width: '100%' },
    containerListView: {
        display: 'none',
    },
    header: {
        fontSize: theme.fontSizes.mainHeader,
        fontWeight: 'normal',
    },
    tabContainer: {
        margin: '0rem 2rem 2rem 2rem',
    },
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
    noItemsParagraph: {
        margin: '1rem 0',
    },
    link: {
        display: 'block',
        margin: '1rem 0 0 0',
    },
}));
