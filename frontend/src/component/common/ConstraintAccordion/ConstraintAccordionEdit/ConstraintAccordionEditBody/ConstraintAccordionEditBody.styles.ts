import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    inputContainer: {
        padding: '1rem',
        backgroundColor: theme.palette.neutral.light,
    },
    buttonContainer: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '1rem',
        borderTop: `1px solid ${theme.palette.grey[300]}`,
        width: '100%',
        padding: '1rem',
    },
    innerButtonContainer: {
        marginLeft: 'auto',
    },
    leftButton: {
        marginRight: '0.5rem',
        minWidth: '125px',
    },
    rightButton: {
        marginLeft: '0.5rem',
        minWidth: '125px',
    },
}));
