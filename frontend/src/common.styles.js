import { makeStyles } from '@material-ui/styles';

export const useCommonStyles = makeStyles(theme => ({
    contentSpacingY: {
        '& > *': {
            margin: '0.6rem 0',
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
    },
    bold: {
        fontWeight: 'bold',
    },
    flexRow: {
        display: 'flex',
    },
    flexColumn: {
        display: 'flex',
        flexDirection: 'column',
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
}));
