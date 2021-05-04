import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    percentageContainer: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    percentage: {
        fontWeight: 'bold',
    },
}));
