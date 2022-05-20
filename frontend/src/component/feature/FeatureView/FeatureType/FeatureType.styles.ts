import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    icon: {
        color: theme.palette.inactiveIcon,
    },
}));
