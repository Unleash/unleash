import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    listItem: {
        padding: '0',
        ['& a']: {
            textDecoration: 'none',
            color: 'inherit',
        },
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        }
    },
    deprecated: {
        '& a': {
            color: theme.palette.links.deprecated,
        },
    },
}));
