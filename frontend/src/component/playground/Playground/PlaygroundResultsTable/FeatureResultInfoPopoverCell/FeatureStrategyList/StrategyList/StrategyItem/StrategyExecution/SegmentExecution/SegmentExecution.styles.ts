import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {},
    link: {
        textDecoration: 'none',
        marginLeft: theme.spacing(1),
        '&:hover': {
            textDecoration: 'underline',
        },
    },
}));
