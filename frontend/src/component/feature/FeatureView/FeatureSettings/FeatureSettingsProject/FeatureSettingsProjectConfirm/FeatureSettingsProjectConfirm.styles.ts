import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'grid',
        gap: theme.spacing(2),
        paddingTop: theme.spacing(2),
    },
}));
