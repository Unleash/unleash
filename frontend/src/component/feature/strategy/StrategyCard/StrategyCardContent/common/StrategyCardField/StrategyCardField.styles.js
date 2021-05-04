import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    fieldContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        margin: '0.4rem 0',
    },
    fieldValue: {
        maxWidth: '50%',
    },
}));
