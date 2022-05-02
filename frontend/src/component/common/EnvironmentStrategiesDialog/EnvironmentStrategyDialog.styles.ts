import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    infoText: {
        marginBottom: '10px',
        fontSize: theme.fontSizes.bodySize,
    },
}));
