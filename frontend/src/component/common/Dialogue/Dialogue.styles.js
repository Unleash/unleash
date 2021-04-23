import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    dialogTitle: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.dialogue.title.main,
        height: '150px',
        padding: '2rem 3rem',
        clipPath: ' ellipse(130% 115px at 120% 20%)',
    },
    dialogContentPadding: {
        padding: '2rem 3rem',
    },
}));
