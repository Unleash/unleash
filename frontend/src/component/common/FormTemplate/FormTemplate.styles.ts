import { makeStyles } from '@material-ui/core/styles';

export const formTemplateSidebarWidth = '27.5rem';

export const useStyles = makeStyles(theme => ({
    container: {
        minHeight: '80vh',
        width: '100%',
        display: 'flex',
        margin: '0 auto',
        borderRadius: '1rem',
        overflow: 'hidden',
        [theme.breakpoints.down(1100)]: {
            flexDirection: 'column',
            minHeight: 0,
        },
    },
    modal: {
        minHeight: '100vh',
        borderRadius: 0,
    },
    sidebar: {
        backgroundColor: theme.palette.primary.light,
        padding: '2rem',
        flexGrow: 0,
        flexShrink: 0,
        width: formTemplateSidebarWidth,
        [theme.breakpoints.down(1100)]: {
            width: '100%',
        },
        [theme.breakpoints.down(500)]: {
            padding: '2rem 1rem',
        },
    },
    title: {
        marginBottom: '1.5rem',
        fontWeight: 'normal',
    },
    subtitle: {
        color: '#fff',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 'normal',
    },
    description: {
        color: '#fff',
        zIndex: 1,
        position: 'relative',
    },
    linkContainer: {
        margin: '1.5rem 0',
        display: 'flex',
        alignItems: 'center',
    },
    linkIcon: {
        marginRight: '0.5rem',
        color: '#fff',
    },
    documentationLink: {
        color: '#fff',
        display: 'block',
    },
    formContent: {
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '3rem',
        flexGrow: 1,
        [theme.breakpoints.down(1200)]: {
            padding: '2rem',
        },
        [theme.breakpoints.down(1100)]: {
            width: '100%',
        },
        [theme.breakpoints.down(500)]: {
            padding: '2rem 1rem',
        },
    },
    icon: { fill: '#fff' },
    mobileGuidanceBgContainer: {
        zIndex: 1,
        position: 'absolute',
        right: -3,
        top: -3,
    },
    mobileGuidanceBackground: {
        width: '75px',
        height: '75px',
    },
    mobileGuidanceButton: {
        position: 'absolute',
        zIndex: 400,
        right: 0,
    },
    infoIcon: {
        fill: '#fff',
    },
}));
