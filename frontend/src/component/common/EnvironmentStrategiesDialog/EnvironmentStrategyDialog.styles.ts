import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    envName: {
        display: 'inline-block',
        width: '90px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    infoText: {
        marginBottom: '10px',
        fontSize: theme.fontSizes.bodySize,
    },
}));
