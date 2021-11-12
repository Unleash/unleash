import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        borderRadius: '10px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '350px',
        minWidth: '350px',
        marginRight: '1rem',
    },
    paddingContainerTop: {
        padding: '1.5rem 1.5rem 0 1.5rem',
    },
    paddingContainerBottom: {
        padding: '0 1.5rem 1.5rem 1.5rem',
        borderTop: `1px solid ${theme.palette.grey[300]}`,
    },
    metaDataHeader: {
        display: 'flex',
        alignItems: 'center',
    },
    header: {
        fontSize: theme.fontSizes.subHeader,
        fontWeight: 'normal',
        margin: 0,
    },
    body: {
        margin: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
    },
    bodyItem: {
        margin: '0.5rem 0',
        fontSize: theme.fontSizes.bodySize,
    },
    headerIcon: {
        marginRight: '1rem',
        height: '40px',
        width: '40px',
        fill: theme.palette.primary.main,
    },
    descriptionContainer: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.grey[600],
    },
    [theme.breakpoints.down(1000)]: {
        container: {
            width: '100%',
            maxWidth: 'none',
            minWidth: 'auto',
        },
    },
}));
