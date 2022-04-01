import { makeStyles } from '@material-ui/core/styles';

export const useCommonStyles = makeStyles(theme => ({
    contentSpacingY: {
        '& > *': {
            marginTop: '0.5rem !important',
            marginBottom: '0.5rem !important',
        },
    },
    contentSpacingYLarge: {
        '& > *': {
            marginTop: '1.5rem !important',
            marginBottom: '1.5rem !important',
        },
    },
    contentSpacingX: {
        '& > *': {
            marginRight: '0.8rem !important',
            marginLeft: '0.8rem !important',
        },
    },
    relative: {
        position: 'relative',
    },
    divider: {
        margin: '1rem 0',
        // @ts-expect-error
        backgroundColor: theme.palette.division.main,
        height: '3px',
        width: '100%',
    },
    largeDivider: {
        margin: '2rem 0',
        // @ts-expect-error
        backgroundColor: theme.palette.division.main,
        height: '3px',
        width: '100%',
    },
    bold: {
        fontWeight: 'bold',
    },
    flexRow: {
        display: 'flex',
        alignItems: 'center',
    },
    flexColumn: {
        display: 'flex',
        flexDirection: 'column',
    },
    itemsCenter: {
        alignItems: 'center',
    },
    justifyCenter: {
        justifyContent: 'center',
    },
    flexWrap: {
        flexWrap: 'wrap',
    },
    textCenter: {
        textAlign: 'center',
    },
    fullWidth: {
        width: '100%',
    },
    fullHeight: {
        height: '100%',
    },
    title: {
        fontSize: theme.fontSizes.mainHeader,
        fontWeight: 'bold',
        marginBottom: '0.5rem',
    },
    fadeInBottomStartNoPosition: {
        transform: 'translateY(400px)',
        opacity: '0',
        boxShadow: `rgb(129 129 129 / 40%) 4px 5px 11px 4px`,
        zIndex: 500,
        width: '100%',
        backgroundColor: '#fff',
        right: 0,
        bottom: 0,
        left: 0,
        height: '300px',
        position: 'fixed',
    },
    fadeInBottomStart: {
        opacity: '0',
        position: 'fixed',
        right: '40px',
        bottom: '40px',
        transform: 'translateY(400px)',
    },
    fadeInBottomStartWithoutFixed: {
        opacity: '0',
        right: '40px',
        bottom: '40px',
        transform: 'translateY(400px)',
        zIndex: 1400,
        position: 'fixed',
    },
    fadeInBottomEnter: {
        transform: 'translateY(0)',
        opacity: '1',
        transition: 'transform 0.6s ease, opacity 1s ease',
    },
    fadeInBottomLeave: {
        transform: 'translateY(400px)',
        opacity: '0',
        transition: 'transform 1.25s ease, opacity 1s ease',
    },
    fadeInTopStart: {
        opacity: '0',
        position: 'fixed',
        right: '40px',
        top: '40px',
        transform: 'translateY(-400px)',
        [theme.breakpoints.down('xs')]: {
            right: 20,
            left: 10,
            top: 40,
        },
    },
    fadeInTopEnter: {
        transform: 'translateY(100px)',
        opacity: '1',
        transition: 'transform 0.6s ease, opacity 1s ease',
    },
    fadeInTopLeave: {
        transform: 'translateY(-400px)',
        opacity: '0',
        transition: 'transform 1.25s ease, opacity 1s ease',
    },
    error: {
        fontSize: theme.fontSizes.smallBody,
        color: theme.palette.error.main,
    },
}));
