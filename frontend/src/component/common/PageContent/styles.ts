import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    headerContainer: {
        padding: theme.spacing(2, 4),
        borderBottom: `1px solid ${theme.palette.grey[100]}`,
        [theme.breakpoints.down('md')]: {
            padding: '1.5rem 1rem',
        },
    },
    bodyContainer: {
        padding: '2rem',
        [theme.breakpoints.down('md')]: {
            padding: '1rem',
        },
    },
    paddingDisabled: {
        padding: '0',
    },
    borderDisabled: {
        border: 'none',
    },
}));
