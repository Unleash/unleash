import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    rolesListBody: {
        padding: theme.spacing(4),
        paddingBottom: '4rem',
        minHeight: '50vh',
        position: 'relative',
    },
}));
