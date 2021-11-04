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
            paddingRight: '45px',
            paddingLeft: '40px',
        },
    },
    iconButtonWrapper: {
        position: 'absolute',
        top: '300px',
        right: '-25px',
        [theme.breakpoints.down(700)]: {
            right: '-15px',
        },
    },
    iconButton: {
        [theme.breakpoints.down(700)]: {
            right: '-10px',
            background: `conic-gradient(rgba(255, 0, 0, 0), 50%, rgb(196, 196, 196) 50%)`,
        },
        background: `conic-gradient(rgb(255, 255, 255), 50%, rgb(196, 196, 196) 50%)`,
        color: '#fff',
        '&:hover': {
            background: `conic-gradient(rgba(255, 0, 0, 0), 50%, rgb(196, 196, 196) 50%)`,
        },
    },
    icon: {
        transition: 'transform 0.4s ease',
        transitionDelay: '0.4s',
        position: 'relative',
        left: '-8px',
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
