import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    deleteParagraph: {
        marginTop: theme.spacing(3),
    },
    roleDeleteInput: {
        marginTop: '1rem',
    },
}));
