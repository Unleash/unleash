import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        width: '100%',
        padding: theme.spacing(2, 3),
        borderRadius: theme.shape.borderRadiusMedium,
        border: `1px solid ${theme.palette.divider}`,
    },
    chip: {
        margin: '0.25rem',
    },
    paragraph: {
        display: 'inline',
        margin: '0.25rem 0',
        maxWidth: '95%',
        textAlign: 'center',
        wordBreak: 'break-word',
    },
}));
