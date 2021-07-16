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
    },
    typeHeader: {
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    tableCellName: {
        width: '250px',
    },
    tableCellEnv: {
        width: '20px',
    },
    tableCellType: {
        display: 'flex',
        alignItems: 'center',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    icon: {
        marginRight: '0.3rem',
    },
}));
