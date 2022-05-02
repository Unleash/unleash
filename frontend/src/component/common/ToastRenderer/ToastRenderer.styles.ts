import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    toastWrapper: {
        right: 0,
        left: 0,
        margin: '0 auto',
        maxWidth: '450px',
    },
}));
