import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        borderRadius: theme.shape.borderRadiusMedium,
        border: `1px solid ${theme.palette.grey[300]}`,
        '& + &': {
            marginTop: '1rem',
        },
        background: theme.palette.background.default,
    },
    header: {
        padding: theme.spacing(0.5, 2),
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
        fontWeight: theme.typography.fontWeightMedium,
    },
    icon: {
        fill: theme.palette.inactiveIcon,
    },
    actions: {
        marginLeft: 'auto',
        display: 'flex',
    },
    body: {
        padding: '1rem',
        display: 'grid',
        justifyItems: 'center',
    },
}));
