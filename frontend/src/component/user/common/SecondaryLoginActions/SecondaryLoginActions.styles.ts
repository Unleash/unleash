import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        margin: 'auto auto 0 auto',
        width: '230px',
        [theme.breakpoints.down('md')]: {
            marginTop: '1rem',
        },
    },
    link: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    text: { fontWeight: 'bold', marginBottom: '0.5rem' },
}));
