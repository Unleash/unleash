import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        minWidth: '300px',
        position: 'absolute',
        right: '80px',
        bottom: '-475px',
        zIndex: 9999,
        opacity: 0,
        transform: 'translateY(100px)',
    },
    inputField: {
        width: '100%',
    },
    header: {
        fontSize: theme.fontSizes.subHeader,
        fontWeight: 'normal',
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
        padding: '1rem',
    },
    body: { padding: '1rem' },
    subheader: {
        display: 'flex',
        alignItems: 'center',
        fontSize: theme.fontSizes.bodySize,
        fontWeight: 'normal',
    },
    icon: {
        marginRight: '0.5rem',
        fill: theme.palette.grey[600],
    },
    formHeader: {
        fontSize: theme.fontSizes.bodySize,
    },
    buttonGroup: {
        marginTop: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
    },
    editEnvButton: {
        width: '150px',
    },
    fadeInBottomEnter: {
        transform: 'translateY(0)',
        opacity: '1',
        transition: 'transform 0.4s ease, opacity .4s ease',
    },
    fadeInBottomLeave: {
        transform: 'translateY(100px)',
        opacity: '0',
        transition: 'transform 0.4s ease, opacity 0.4s ease',
    },
}));
