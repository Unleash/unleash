import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        borderRadius: '5px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        maxWidth: '350px',
        minWidth: '350px',
        marginRight: '1rem',
    },
    metaDataHeader: {
        display: 'flex',
        alignItems: 'center',
    },
    headerIcon: {
        marginRight: '1rem',
        fill: theme.palette.primary.main,
    },
}));
