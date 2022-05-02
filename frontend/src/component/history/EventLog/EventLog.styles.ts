import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    eventEntry: {
        border: `1px solid ${theme.palette.grey[100]}`,
        padding: '1rem',
        margin: '1rem 0',
        borderRadius: theme.borderRadius.main,
    },
    history: {
        '& code': {
            wordWrap: 'break-word',
            whiteSpace: 'pre',
            fontFamily: 'monospace',
            lineHeight: '100%',
            color: theme.code.main,
        },
        '& code > .diff-N': {
            color: theme.code.diffAdd,
        },
        '& code > .diff-D': {
            color: theme.code.diffSub,
        },
        '& code > .diff-A, .diff-E': {
            color: theme.code.diffNeutral,
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
