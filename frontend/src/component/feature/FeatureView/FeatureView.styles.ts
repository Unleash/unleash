import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        borderRadius: theme.shape.borderRadiusLarge,
        boxShadow: 'none',
        display: 'flex',
    },
    header: {
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadiusLarge,
        marginBottom: '1rem',
    },
    toggleInfoContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    toolbarContainer: {
        flexShrink: 0,
        display: 'flex',
    },
    innerContainer: {
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        [theme.breakpoints.down(500)]: {
            flexDirection: 'column',
        },
    },
    separator: {
        width: '100%',
        backgroundColor: theme.palette.grey[200],
        height: '1px',
    },
    tabContainer: {
        padding: '0 2rem',
    },
    tabButton: {
        textTransform: 'none',
        width: 'auto',
        fontSize: '1rem',
        padding: '0 !important',
        [theme.breakpoints.up('md')]: {
            minWidth: 160,
        },
    },
    featureViewHeader: {
        fontSize: theme.fontSizes.mainHeader,
        fontWeight: 'normal',
        display: 'flex',
        alignItems: 'center',
        wordBreak: 'break-all',
    },
    statusContainer: {
        marginLeft: '0.5rem',
    },
}));
