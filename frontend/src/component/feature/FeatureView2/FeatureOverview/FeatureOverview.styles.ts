import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: { display: 'flex', width: '100%' },
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
}));
