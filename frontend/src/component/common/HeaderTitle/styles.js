import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    headerTitleContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    headerTitle: {
        fontSize: theme.fontSizes.mainHeader,
        fontWeight: 500,
    },
    headerActions: {
        position: 'absolute',
        right: 0,
    },
}));
