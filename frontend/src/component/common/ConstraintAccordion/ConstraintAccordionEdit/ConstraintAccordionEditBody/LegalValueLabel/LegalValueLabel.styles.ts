import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'inline-block',
        wordBreak: 'break-word',
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
