import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    sidebar: {
        width: '30%',
        padding: '2rem',
        borderRight: `1px solid ${theme.palette.grey[300]}`,
        transition: 'width 0.3s ease',
        position: 'relative',
        minHeight: '400px',
        [theme.breakpoints.down(900)]: {
            width: '50%',
        },
        [theme.breakpoints.down(700)]: {
            padding: '1rem',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
    },
    sidebarSmall: {
        width: '10%',
        [theme.breakpoints.down(700)]: {
            width: '15%',
        },
    },
    iconButtonWrapper: {
        position: 'absolute',
        top: '300px',
        right: '-25px',
    },
    iconButton: {
        backgroundColor: `${theme.palette.grey[300]}!important`,
        [theme.breakpoints.down(700)]: {
            right: '-10px',
        },
    },
    icon: {
        transition: 'transform 0.4s ease',
        transitionDelay: '0.4s',
    },
    expandedIcon: {
        transform: 'rotate(180deg)',
    },
    mobileNavContainer: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        padding: '1rem',
    },
}));
