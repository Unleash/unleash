import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    chip: {
        background: 'transparent',
        border: `1px solid ${theme.palette.primary.main}`,
        color: theme.palette.primary.main,
    },
}));
