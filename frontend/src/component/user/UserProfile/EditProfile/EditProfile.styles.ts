import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        width: '100%',
        transform: 'translateY(-30px)',
    },
    form: {
        width: '100%',
        '& > *': {
            width: '100%',
        },
    },
    editProfileTitle: {
        fontWeight: 'bold',
    },
    button: {
        width: '150px',
        marginTop: '1.15rem',
        [theme.breakpoints.down('md')]: {
            width: '100px',
        },
    },
}));
