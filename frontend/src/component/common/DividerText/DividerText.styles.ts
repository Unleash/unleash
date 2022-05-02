import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '1rem auto',
    },
    wing: {
        width: '80px',
        height: '3px',
        backgroundColor: theme.palette.division.main,
        borderRadius: theme.borderRadius.main,
    },
    text: {
        textAlign: 'center',
        display: 'block',
        margin: '0 1rem',
    },
}));
