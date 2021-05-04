import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    strategyCard: {
        width: '337px',
        height: '100%',
        [theme.breakpoints.down('xs')]: {
            width: '100%',
        },
        [theme.breakpoints.down('1250')]: {
            width: '300px',
        },
        [theme.breakpoints.down('1035')]: {
            width: '280px',
        },
        [theme.breakpoints.down('860')]: {
            width: '380px',
        },
    },
}));
