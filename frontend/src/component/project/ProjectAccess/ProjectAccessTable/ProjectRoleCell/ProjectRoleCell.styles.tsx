import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    cell: {
        padding: theme.spacing(0, 1.5),
        display: 'flex',
        alignItems: 'center',
    },
}));
