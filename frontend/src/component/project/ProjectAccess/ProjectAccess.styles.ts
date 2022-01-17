import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    pageContent: {
        minHeight: '200px',
    },
    divider: {
        height: '1px',
        width: '106.65%',
        marginLeft: '-2rem',
        backgroundColor: '#efefef',
        marginTop: '2rem',
    },
    actionList: {
        display: 'flex',
        alignItems: 'center',
    },
    inputLabel: { backgroundColor: '#fff' },
    roleName: {
        fontWeight: 'bold',
        padding: '5px 0px',
    },
    iconButton: {
        marginLeft: '0.5rem',
    },
    menuItem: {
        width: '340px',
        whiteSpace: 'normal',
    },
    projectRoleSelect: {
        minWidth: '150px',
    },
}));
