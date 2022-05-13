import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    menuContainer: {
        borderRadius: theme.shape.borderRadiusLarge,
        padding: theme.spacing(1),
    },
    item: {
        borderRadius: theme.shape.borderRadius,
    },
    text: {
        fontSize: theme.fontSizes.smallBody,
    },
}));
