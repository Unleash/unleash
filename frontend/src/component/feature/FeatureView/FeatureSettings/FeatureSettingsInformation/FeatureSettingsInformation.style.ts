import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        alignItems: 'center',
    },
    header: {
        fontSize: theme.fontSizes.mainHeader,
    },
}));
