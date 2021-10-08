import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    tableRow: {
        cursor: 'pointer',
    },
    tableCell: {
        border: 'none',
        padding: '0.25rem 0',
    },
    tableCellHeader: {
        paddingBottom: '0.5rem',
        fontWeight: 'normal',
        color: theme.palette.grey[600],
        borderBottom: '1px solid ' + theme.palette.grey[200],
    },
    typeHeader: {
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    tableCellStatus: {
        width: '50px',
    },
    tableCellName: {
        width: '250px',
        display: 'flex',
    },
    tableCellEnv: {
        width: '20px',
    },
    tableCellType: {
        width: '32px',
        alignItems: 'center',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    icon: {
        color: theme.palette.grey[600],
    },
}));
