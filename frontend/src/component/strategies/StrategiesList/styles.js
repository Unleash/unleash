import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    listItem: {
        padding: '0',
    },
    deprecated: {
        '& a': {
            color: theme.palette.links.deprecated,
        },
    },
}));
