import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    badge: {
        backgroundColor: theme.palette.checkmarkBadge,
        width: '75px',
        height: '75px',
        borderRadius: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        [theme.breakpoints.down('sm')]: {
            width: '50px',
            height: '50px',
        },
    },
    check: {
        color: '#fff',
        width: '35px',
        height: '35px',
    },
}));
