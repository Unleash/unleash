import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    cell: {
        padding: theme.spacing(1, 1.5),
    },
}));
