import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    reportToggleList: {
        width: '100%',
        margin: 'var(--card-margin-y) 0',
        borderRadius: 10,
        boxShadow: 'none',
    },
    bulkAction: {
        backgroundColor: '#f2f2f2',
        fontSize: 'var(--p-size)',
    },

    sortIcon: {
        marginLeft: 8,
    },

    reportToggleListHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #f1f1f1',
        padding: '1rem var(--card-padding-x)',
    },

    reportToggleListInnerContainer: {
        padding: 'var(--card-padding)',
    },

    reportToggleListHeading: {
        fontSize: 'var(--h1-size)',
        margin: 0,
        fontWeight: 'bold',
    },

    reportIcon: {
        fontsize: '1.5rem',
        marginRight: 5,
    },

    reportingToggleTable: {
        width: ' 100%',
        borderSpacing: '0 0.8rem',
        '& th': {
            textAlign: 'left',
            cursor: 'pointer',
        },
    },
    expired: {
        color: 'var(--danger)',
    },

    active: {
        color: 'var(--success)',
    },

    stale: {
        color: 'var(--danger)',
    },

    reportStatus: {
        display: 'flex',
        alignItems: 'center',
    },

    tableRow: {
        '&:hover': {
            backgroundColor: '#eeeeee',
        },
    },
    checkbox: {
        margin: 0,
        padding: 0,
    },

    link: {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        fontWeight: theme.fontWeight.bold,
    },

    [theme.breakpoints.down(800)]: {
        hideColumn: {
            display: 'none',
        },
        th: {
            minWidth: '120px',
        },
    },

    [theme.breakpoints.down(550)]: {
        hideColumnStatus: {
            display: 'none',
        },
    },

    [theme.breakpoints.down(425)]: {
        hideColumnLastSeen: {
            display: 'none',
        },
    },
}));
