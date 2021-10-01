import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        borderRadius: '10px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',

        maxWidth: '350px',
        minWidth: '350px',
        marginRight: '1rem',
        marginTop: '1rem',
    },
    tagheaderContainer: {
        display: 'flex',
        alignItems: 'center',
        padding: '1.5rem',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
    },
    tagHeader: {
        display: 'flex',
        alignItems: 'center',
    },
    tag: {
        height: '40px',
        width: '40px',
        fill: theme.palette.primary.main,
        marginRight: '0.8rem',
    },
    tagHeaderText: {
        fontSize: theme.fontSizes.subHeader,
        fontWeight: 'normal',
        margin: 0,
    },
    tagContent: {
        padding: '1.5rem',
    },
}));
