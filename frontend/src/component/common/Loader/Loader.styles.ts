import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    loader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.paper,
    },
    img: {
        width: '100px',
        height: '100px',
    },
}));
