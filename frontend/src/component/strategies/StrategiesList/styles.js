import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    listItem: {
        padding: '0',
        ['& a']: {
            textDecoration: 'none',
            color: 'inherit',
        },
    },
    deprecated: {
        '& a': {
            color: theme.palette.links.deprecated,
        },
    },
}));
