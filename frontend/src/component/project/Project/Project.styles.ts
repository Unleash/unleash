import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    containerStyles: {
        marginTop: '1.5rem',
        display: 'flex',
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
        },
    },
}));
