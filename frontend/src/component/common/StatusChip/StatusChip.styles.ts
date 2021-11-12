import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    chip: {
        margin: '0 8px',
        background: 'transparent',
        border: `1px solid ${theme.palette.primary.main}`,
        color: theme.palette.primary.main,
    },
}));
