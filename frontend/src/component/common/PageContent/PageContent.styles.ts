import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        borderRadius: theme.shape.borderRadiusLarge,
        boxShadow: 'none',
    },
    headerContainer: {
        padding: theme.spacing(2, 4),
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: theme.palette.divider,
        [theme.breakpoints.down('md')]: {
            padding: '1.5rem 1rem',
        },
    },
    bodyContainer: {
        padding: theme.spacing(4),
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(2),
        },
    },
    paddingDisabled: {
        padding: '0',
    },
    borderDisabled: {
        border: 'none',
    },
}));
