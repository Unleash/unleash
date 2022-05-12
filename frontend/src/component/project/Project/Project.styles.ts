import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    containerStyles: {
        marginTop: '1.5rem',
        display: 'flex',
        [theme.breakpoints.down('md')]: {
            flexDirection: 'column',
        },
    },
    projectToggles: { width: '100%', minHeight: '100%' },
    header: {
        backgroundColor: '#fff',
        borderRadius: theme.shape.borderRadiusLarge,
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
        padding: '0 2rem',
    },
    tabButton: {
        textTransform: 'none',
        width: 'auto',
        fontSize: '1rem',
        [theme.breakpoints.up('md')]: {
            minWidth: 160,
        },
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
