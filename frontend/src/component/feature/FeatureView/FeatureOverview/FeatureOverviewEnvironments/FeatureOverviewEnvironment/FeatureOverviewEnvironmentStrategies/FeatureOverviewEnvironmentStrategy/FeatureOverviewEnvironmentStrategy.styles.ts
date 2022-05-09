import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.grey[300]}`,
        '& + &': {
            marginTop: '1rem',
        },
    },
    header: {
        padding: '0.5rem',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
    },
    icon: {
        fill: theme.palette.grey[600],
    },
    actions: {
        marginLeft: 'auto',
    },
    body: {
        padding: '1rem',
        display: 'grid',
        gap: '1rem',
        justifyItems: 'center',
    },
}));
