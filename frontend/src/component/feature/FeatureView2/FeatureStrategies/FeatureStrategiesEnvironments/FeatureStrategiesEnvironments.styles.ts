import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        width: '70%',
    },
    fullWidth: {
        width: '90%',
    },
    environmentsHeader: {
        padding: '2rem 2rem 1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tabContentContainer: {
        padding: '1rem 2rem 2rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
    },
    listContainer: { width: '70%' },
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
}));
