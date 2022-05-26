import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    pageContent: {
        minHeight: '200px',
    },
    divider: {
        height: '1px',
        position: 'relative',
        left: 0,
        right: 0,
        backgroundColor: theme.palette.divider,
        margin: theme.spacing(4, -4, 3),
    },
    inputLabel: { backgroundColor: '#fff' },
    roleName: {
        fontWeight: 'bold',
        padding: '5px 0px',
    },
    menuItem: {
        width: '340px',
        whiteSpace: 'normal',
    },
    projectRoleSelect: {
        minWidth: '150px',
    },
}));
