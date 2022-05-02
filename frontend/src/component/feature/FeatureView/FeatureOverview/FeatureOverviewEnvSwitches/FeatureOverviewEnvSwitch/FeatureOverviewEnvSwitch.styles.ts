import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    label: {
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
}));
