import { makeStyles } from '@material-ui/styles';

export const useCommonStyles = makeStyles(theme => ({
    contentSpacingY: {
        '& > *': {
            margin: '0.5rem 0',
        },
    },
    contentSpacingYLarge: {
        '& > *': {
            margin: '1.5rem 0',
        },
    },
    contentSpacingX: {
        '& > *': {
            margin: '0 0.8rem',
        },
    },
    divider: {
        margin: '1rem 0',
        backgroundColor: theme.palette.division.main,
        height: '3px',
        width: '100%',
    },
    largeDivider: {
        margin: '2rem 0',
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
}));
