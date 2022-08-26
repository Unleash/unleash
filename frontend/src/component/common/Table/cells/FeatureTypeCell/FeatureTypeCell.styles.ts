import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        padding: theme.spacing(1.5),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        color: theme.palette.inactiveIcon,
    },
}));
