import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    listItem: {
        padding: '0',
        ['& a']: {
            textDecoration: 'none',
            color: 'inherit',
        },
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    deprecated: {
        '& a': {
            // @ts-expect-error
            color: theme.palette.links.deprecated,
        },
    },
}));
