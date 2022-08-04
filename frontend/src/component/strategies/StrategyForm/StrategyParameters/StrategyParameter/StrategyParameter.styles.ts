import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    paramsContainer: {
        maxWidth: '400px',
        margin: '1rem 0',
    },
    divider: {
        borderStyle: 'dashed',
        margin: '1rem 0 1.5rem 0',
        borderColor: theme.palette.grey[500],
    },
    nameContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    name: {
        minWidth: '365px',
        width: '100%',
    },
    input: {
        minWidth: '365px',
        width: '100%',
        marginBottom: '1rem',
    },
    description: {
        minWidth: '365px',
        marginBottom: '1rem',
    },
    checkboxLabel: {
        marginTop: '-0.5rem',
    },
    inputDescription: {
        marginBottom: '0.5rem',
    },
    errorMessage: {
        fontSize: theme.fontSizes.smallBody,
        color: theme.palette.error.main,
        position: 'absolute',
        top: '-8px',
    },
    paramButton: {
        color: theme.palette.primary.dark,
    },
}));
