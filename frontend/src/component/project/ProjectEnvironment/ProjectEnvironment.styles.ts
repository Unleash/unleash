import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        [theme.breakpoints.down('sm')]: {
            justifyContent: 'center',
        },
    },
    apiError: {
        maxWidth: '400px',
        marginBottom: '1rem',
    },
    cardLink: {
        color: 'inherit',
        textDecoration: 'none',
        border: 'none',
        padding: '0',
        background: 'transparent',
        fontFamily: theme.typography.fontFamily,
        pointer: 'cursor',
    },
}));
