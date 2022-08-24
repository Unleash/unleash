import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        padding: theme.spacing(0.5, 1.5),
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.constraintAccordion.operatorBackground,
        lineHeight: 1.25,
    },
    name: {
        fontSize: theme.fontSizes.smallBody,
        lineHeight: 17 / 14,
    },
    text: {
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.grey[700],
    },
    not: {
        display: 'block',
        margin: '-1rem 0 0.25rem 0',
        height: '1rem',
        '& > span': {
            display: 'inline-block',
            padding: '0 0.25rem',
            borderRadius: theme.shape.borderRadius,
            fontSize: theme.fontSizes.smallerBody,
            backgroundColor: theme.palette.primary.light,
            color: 'white',
        },
    },
}));
