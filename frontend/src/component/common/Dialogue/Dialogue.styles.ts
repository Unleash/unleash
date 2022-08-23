import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    dialogTitle: {
        backgroundColor: theme.palette.dialogHeaderBackground,
        color: theme.palette.dialogHeaderText,
        height: '150px',
        padding: '2rem 3rem',
        clipPath: ' ellipse(130% 115px at 120% 20%)',
    },
    dialogContentPadding: {
        padding: '2rem 3rem',
    },
}));
