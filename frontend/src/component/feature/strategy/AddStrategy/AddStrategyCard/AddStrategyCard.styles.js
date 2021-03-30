import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    addStrategyCard: {
        width: '200px',
        minHeight: '200px',
        textAlign: 'center',
        borderTop: `4px solid ${theme.palette.primary.main}`,
        display: 'flex',
        flexDirection: 'column',
    },
    addStrategyButton: {
        marginTop: 'auto',
    },
}));
