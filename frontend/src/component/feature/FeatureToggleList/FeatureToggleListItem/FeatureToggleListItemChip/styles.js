import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    typeChip: {
        margin: '0 8px',
        background: 'transparent',
        border: `1px solid ${theme.palette.primary.main}`,
        color: theme.palette.primary.main,
    },
}));
