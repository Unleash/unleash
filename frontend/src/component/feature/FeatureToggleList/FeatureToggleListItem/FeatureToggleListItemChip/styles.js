import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    typeChip: {
        margin: '0 8px',
        boxShadow: theme.boxShadows.chip.main,
        backgroundColor: theme.palette.chips.main,
    },
}));
