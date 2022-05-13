import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        margin: theme.spacing(-1, 0),
    },
    menuContainer: {
        borderRadius: theme.shape.borderRadiusLarge,
        paddingBottom: theme.spacing(2),
    },
    menuHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(1, 1, 0, 4),
    },
    menuItem: {
        padding: theme.spacing(0, 2),
        margin: theme.spacing(0, 2),
        borderRadius: theme.shape.borderRadius,
    },
    checkbox: {
        padding: theme.spacing(0.75, 1),
    },
    divider: {
        '&.MuiDivider-root.MuiDivider-fullWidth': {
            margin: theme.spacing(0.75, 0),
        },
    },
}));
