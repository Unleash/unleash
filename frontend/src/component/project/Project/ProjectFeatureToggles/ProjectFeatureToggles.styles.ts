import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        boxShadow: 'none',
        marginLeft: '1rem',
        minHeight: '100%',
        width: 'calc(100% - 1rem)',
        position: 'relative',
        [theme.breakpoints.down('md')]: {
            marginLeft: '0',
            paddingBottom: '4rem',
            width: 'inherit',
        },
    },
}));
