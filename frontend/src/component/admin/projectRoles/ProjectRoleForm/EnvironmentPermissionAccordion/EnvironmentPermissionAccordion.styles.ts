import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    environmentPermissionContainer: {
        marginBottom: '1.25rem',
    },
    accordionSummary: {
        boxShadow: 'none',
        padding: '0',
    },
    label: {
        minWidth: '300px',
        [theme.breakpoints.down(600)]: {
            minWidth: 'auto',
        },
    },
    accordionHeader: {
        display: 'flex',
        alignItems: 'center',
        [theme.breakpoints.down(500)]: {
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
    },
    accordionBody: {
        padding: '0',
        flexWrap: 'wrap',
    },
    header: {
        color: theme.palette.primary.main,
    },
    icon: {
        fill: theme.palette.primary.main,
    },
}));
