import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    containerStyles: {
        marginTop: '1.5rem',
        display: 'flex',
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
        },
    },
    projectToggles: { width: '100%', minHeight: '100%' },
    header: {
        backgroundColor: '#fff',
        borderRadius: '10px',
        marginBottom: '1rem',
    },
    innerContainer: {
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
    },
    separator: {
        width: '100%',
        backgroundColor: theme.palette.grey[200],
        height: '1px',
    },
    tabContainer: {
        padding: '1rem 2rem',
    },
    tabButton: {
        textTransform: 'none',
        width: 'auto',
        fontSize: '1rem',
    },
    title: {
        fontSize: theme.fontSizes.mainHeader,
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gridGap: '1rem',
    },
    titleText: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
}));
