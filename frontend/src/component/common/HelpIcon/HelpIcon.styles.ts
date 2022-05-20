import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'inline-grid',
        alignItems: 'center',
        outline: 0,

        '&:is(:focus-visible, :active) > *, &:hover > *': {
            outlineStyle: 'solid',
            outlineWidth: 2,
            outlineOffset: 0,
            outlineColor: theme.palette.primary.main,
            borderRadius: '100%',
            color: theme.palette.primary.main,
        },
    },
    icon: {
        fontSize: '1rem',
        color: theme.palette.inactiveIcon,
    },
}));
