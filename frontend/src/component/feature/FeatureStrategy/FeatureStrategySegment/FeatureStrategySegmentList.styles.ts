import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
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
        color: theme.palette.grey[600],
        fontSize: theme.fontSizes.smallerBody,
        border: '1px solid',
        borderColor: theme.palette.grey[300],
        paddingInline: '0.4rem',
        marginBlock: '0.2rem',
        display: 'grid',
        alignItems: 'center',
        borderRadius: theme.borders.radius.main,
    },
}));
