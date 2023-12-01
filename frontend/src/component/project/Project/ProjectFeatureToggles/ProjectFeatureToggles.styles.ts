import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
    container: {
        boxShadow: 'none',
        minHeight: '100%',
        position: 'relative',
        [theme.breakpoints.down('md')]: {
            paddingBottom: theme.spacing(8),
            width: 'inherit',
        },
    },
}));
