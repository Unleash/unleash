import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    helpText: {
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: theme.fontSizes.smallerBody,
        lineHeight: '14px',
        margin: '0.5rem 0',
    },
    generalSection: {
        margin: '1rem 0',
    },
}));
