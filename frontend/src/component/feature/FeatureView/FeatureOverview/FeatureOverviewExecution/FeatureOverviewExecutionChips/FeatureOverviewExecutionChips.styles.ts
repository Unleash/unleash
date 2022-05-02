import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: { textAlign: 'center' },
    chip: {
        margin: '0.25rem',
    },
    paragraph: {
        margin: '0.25rem 0',
        maxWidth: '95%',
        textAlign: 'center',
        wordBreak: 'break-word',
    },
}));
