import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles({
    contextField: {
        minWidth: '140px',
    },
    operator: {
        minWidth: '105px',
    },
    inputContainer: {
        position: 'relative',
    },
    inputError: {
        position: 'absolute',
        fontSize: '0.9rem',
        color: 'red',
        top: '10px',
        left: '12px',
    },
    tableCell: {
        paddingBottom: '1.25rem',
    },
    helperText: {
        position: 'absolute',
        top: '35px',
    },
});
