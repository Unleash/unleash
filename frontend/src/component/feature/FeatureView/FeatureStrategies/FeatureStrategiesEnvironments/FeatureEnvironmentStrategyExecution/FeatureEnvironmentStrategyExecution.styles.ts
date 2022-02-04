import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: '5px',
        width: '50%',
        marginLeft: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    headerContainer: {
        width: '100%',
        backgroundColor: '#efefef',
    },
    header: {
        color: '#000',
        textAlign: 'left',
        margin: '1rem 1.2rem',
        fontSize: theme.fontSizes.bodySize,
        fontWeight: 'normal',
    },
}));
