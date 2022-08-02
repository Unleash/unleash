import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'grid',
        gap: theme.spacing(4),
    },
    helpText: {
        color: theme.palette.text.secondary,
        fontSize: theme.fontSizes.smallerBody,
        lineHeight: '14px',
        margin: 0,
        marginTop: theme.spacing(1),
    },
}));
