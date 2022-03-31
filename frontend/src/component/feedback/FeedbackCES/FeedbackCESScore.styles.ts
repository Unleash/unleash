import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    scoreInput: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        margin: '0 auto',
    },
    scoreHelp: {
        width: '8rem',
        whiteSpace: 'nowrap',
        color: theme.palette.grey[600],
        '&:first-child': {
            textAlign: 'right',
        },
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
    scoreValue: {
        '& input': {
            clip: 'rect(0 0 0 0)',
            clipPath: 'inset(50%)',
            overflow: 'hidden',
            position: 'absolute',
            whiteSpace: 'nowrap',
            width: 1,
            height: 1,
        },
        '& span': {
            display: 'grid',
            justifyContent: 'center',
            alignItems: 'center',
            background: theme.palette.grey[300],
            width: '3rem',
            height: '3rem',
            borderRadius: '10rem',
            fontSize: '1.25rem',
            paddingBottom: 2,
            userSelect: 'none',
            cursor: 'pointer',
        },
        '& input:checked + span': {
            fontWeight: theme.fontWeight.bold,
            background: theme.palette.primary.main,
            color: 'white',
        },
        '& input:focus-visible + span': {
            outline: '2px solid',
            outlineOffset: 2,
            outlineColor: theme.palette.primary.main,
        },
    },
}));
