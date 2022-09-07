import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    chip: {
        background: 'transparent',
        border: `1px solid ${theme.palette.primary.main}`,
        color: theme.palette.primary.main,
    },
}));
