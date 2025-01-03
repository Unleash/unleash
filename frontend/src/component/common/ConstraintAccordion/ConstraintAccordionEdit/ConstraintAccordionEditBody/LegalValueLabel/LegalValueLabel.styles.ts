import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'inline-block',
        wordBreak: 'break-word',
        padding: theme.spacing(0.5, 1),
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
            border: `1px solid ${theme.palette.primary.main}`,
        },
    },
    value: {
        lineHeight: 1.33,
        fontSize: theme.fontSizes.smallBody,
    },
    description: {
        lineHeight: 1.33,
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.action.active,
    },
}));
