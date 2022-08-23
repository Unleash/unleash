import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        borderRadius: theme.shape.borderRadiusMedium,
        border: `1px solid ${theme.palette.divider}`,
        '& + &': {
            marginTop: theme.spacing(2),
        },
        background: theme.palette.background.paper,
    },
    header: {
        padding: theme.spacing(0.5, 2),
        display: 'flex',
        gap: theme.spacing(1),
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontWeight: theme.typography.fontWeightMedium,
    },
    headerDraggable: {
        paddingLeft: theme.spacing(1),
    },
    icon: {
        fill: theme.palette.inactiveIcon,
    },
    actions: {
        marginLeft: 'auto',
        display: 'flex',
        minHeight: theme.spacing(6),
        alignItems: 'center',
    },
    resultChip: {
        marginLeft: 'auto',
    },
    body: {
        padding: theme.spacing(2),
        justifyItems: 'center',
    },
}));
