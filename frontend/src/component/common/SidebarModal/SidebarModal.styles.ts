import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    modal: {
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100vh',
        maxWidth: 1300,
        overflow: 'auto',
        boxShadow: '0 0 1rem rgba(0, 0, 0, 0.25)',
    },
}));
