import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        width: '100%',
        display: 'grid',
        gap: '1rem',
    },
}));
