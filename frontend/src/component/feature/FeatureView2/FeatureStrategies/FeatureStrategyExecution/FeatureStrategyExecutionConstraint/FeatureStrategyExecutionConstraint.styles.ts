import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    constraint: {
        fontSize: theme.fontSizes.smallBody,
        alignItems: 'center;',
        margin: '0.5rem 0',
        display: 'flex',
        border: `1px solid ${theme.palette.grey[600]}`,
        padding: '0.2rem',
        borderRadius: '5px',
        width: '100%',
        minWidth: '100%',
    },
    constraintName: {
        minWidth: '100px',
        marginRight: '0.5rem',
    },
    constraintOperator: {
        marginRight: '0.5rem',
    },
    constraintValues: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: '50%',
    },
}));
