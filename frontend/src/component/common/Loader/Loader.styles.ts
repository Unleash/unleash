import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    loader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    img: {
        width: '100px',
        height: '100px',
    },
}));
