import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        width: '100%',
        padding: theme.spacing(2, 3),
        borderRadius: theme.shape.borderRadiusMedium,
        border: `1px solid ${theme.palette.dividerAlternative}`,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing(2),
    },
    disabled: {
        backgroundColor: theme.palette.neutral.light,
        opacity: '90%',
    },
    chip: {
        margin: '0.25rem',
    },
    column: {
        flexDirection: 'column',
    },
    paragraph: {
        display: 'inline',
        margin: '0.25rem 0',
        maxWidth: '95%',
        textAlign: 'center',
        wordBreak: 'break-word',
    },
}));
