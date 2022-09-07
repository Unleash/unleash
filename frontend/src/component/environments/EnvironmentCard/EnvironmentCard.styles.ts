import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.palette.grey[200]}`,
        padding: '1.5rem',
        borderRadius: '5px',
        margin: '1.5rem 0',
        minWidth: '450px',
    },
    icon: {
        fill: theme.palette.inactiveIcon,
        marginRight: '0.5rem',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '0.25rem',
    },
    infoContainer: {
        marginTop: '1rem',
        display: 'flex',
        justifyContent: 'space-around',
    },
    infoInnerContainer: {
        textAlign: 'center',
    },
    infoTitle: { fontWeight: 'bold', marginBottom: '0.25rem' },
}));
