import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        padding: '2rem',
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
    },
    headerContainer: {
        display: 'flex',
        alignItems: 'center',
    },
}));
