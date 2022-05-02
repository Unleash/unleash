import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    selectOptionsLink: {
        cursor: 'pointer',
        fontSize: theme.fontSizes.bodySize,
    },
}));
