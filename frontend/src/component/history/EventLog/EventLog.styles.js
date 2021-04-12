import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    eventEntry: {
        border: theme.borders.default,
        padding: '1rem',
        margin: '1rem 0',
        borderRadius: theme.borders.radius.main,
    },
    history: {
        '& code': {
            wordWrap: 'break-word',
            whiteSpace: 'pre',
            fontFamily: 'monospace',
            lineHeight: '100%',
            color: theme.palette.code.main,
        },
        '& code > .diff-N': {
            color: theme.palette.code.diffAdd,
        },
        '& code > .diff-D': {
            color: theme.palette.code.diffSub,
        },
        '& code > .diff-A, .diff-E': {
            color: theme.palette.code.diffNeutral,
        },
        '& dl': {
            padding: '0',
        },
        '& dt': {
            float: 'left',
            clear: 'left',
            fontWeight: 'bold',
        },
        '& dd': {
            margin: '0 0 0 83px',
            padding: '0 0 0.5em 0',
        },
    },
}));
