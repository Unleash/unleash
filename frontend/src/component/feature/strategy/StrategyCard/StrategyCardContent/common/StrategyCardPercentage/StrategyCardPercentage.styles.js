import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    percentageContainer: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    title: {
        fontWeight: theme.fontWeight.semi,
    },
    percentage: {
        color: theme.palette.success.main,
        fontWeight: 'bold',
    },
}));
