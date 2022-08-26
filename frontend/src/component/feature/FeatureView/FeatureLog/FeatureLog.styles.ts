import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        borderRadius: '12.5px',
        backgroundColor: theme.palette.background.paper,
        padding: '2rem',
    },
}));
