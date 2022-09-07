import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    header: {
        display: 'flex',
        padding: theme.spacing(2, 2),
        justifyContent: 'space-between',
    },
    headerName: {
        padding: theme.spacing(0.5, 2),
        display: 'flex',
        gap: theme.spacing(1),
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontWeight: theme.typography.fontWeightMedium,
    },
    icon: {
        fill: theme.palette.inactiveIcon,
    },
    resultChip: {
        marginLeft: 'auto',
    },
    body: {
        padding: theme.spacing(2),
        justifyItems: 'center',
    },
    innerContainer: {
        [theme.breakpoints.down(400)]: {
            padding: '0.5rem',
        },
        width: '100%',
        flexShrink: 0,
        paddingBottom: '1rem',
        borderRadius: theme.shape.borderRadiusMedium,
        background: theme.palette.background.default,
    },
    successBorder: {
        borderColor: theme.palette.success.main,
    },
}));
