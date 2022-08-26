import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'flex',
        alignItems: 'center',
    },
    header: {
        fontSize: theme.fontSizes.mainHeader,
    },
}));
