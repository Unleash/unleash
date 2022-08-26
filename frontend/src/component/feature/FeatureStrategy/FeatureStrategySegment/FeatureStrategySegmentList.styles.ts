import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    title: {
        margin: 0,
        fontSize: theme.fontSizes.bodySize,
        fontWeight: theme.fontWeight.thin,
    },
    list: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    and: {
        fontSize: theme.fontSizes.smallerBody,
        padding: theme.spacing(0.75, 1),
        display: 'block',
        marginTop: 'auto',
        marginBottom: 'auto',
        alignItems: 'center',
        borderRadius: theme.shape.borderRadius,
        lineHeight: 1,
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondaryContainer,
    },
    selectedSegmentsLabel: {
        color: theme.palette.text.secondary,
    },
}));
