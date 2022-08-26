import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    card: {
        display: 'grid',
        gridTemplateColumns: '3rem 1fr',
        width: '20rem',
        padding: '1rem',
        color: 'inherit',
        textDecoration: 'inherit',
        lineHeight: 1.25,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.grey[400],
        borderRadius: theme.spacing(1),
        '&:hover, &:focus': {
            borderColor: theme.palette.primary.main,
        },
    },
    icon: {
        width: '2rem',
        height: 'auto',
        '& > svg': {
            // Styling for SVG icons.
            fill: theme.palette.primary.main,
        },
        '& > div': {
            // Styling for the Rollout icon.
            height: '1rem',
            marginLeft: '-.75rem',
            color: theme.palette.primary.main,
        },
    },
    name: {
        fontWeight: theme.fontWeight.bold,
    },
    description: {
        fontSize: theme.fontSizes.smallBody,
    },
}));
