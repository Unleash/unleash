import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    headerContainer: {
        padding: theme.padding.pageContent.header,
        borderBottom: theme.borders.default,
        [theme.breakpoints.down('sm')]: {
            padding: '1.5rem 1rem',
        },
    },
    bodyContainer: {
        padding: theme.padding.pageContent.body,
        [theme.breakpoints.down('sm')]: {
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
