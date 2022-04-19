import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'inline-block',
    },
    value: {
        lineHeight: 1.33,
        fontSize: theme.fontSizes.smallBody,
    },
    description: {
        lineHeight: 1.33,
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.grey[700],
    },
}));
