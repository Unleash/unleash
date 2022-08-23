import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    chip: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        paddingInlineStart: '1rem',
        paddingInlineEnd: '0.5rem',
        paddingBlockStart: 4,
        paddingBlockEnd: 4,
        borderRadius: '100rem',
        background: theme.palette.featureStrategySegmentChipBackground,
        color: 'white',
    },
    link: {
        marginRight: '.5rem',
        color: 'inherit',
        textDecoration: 'none',
    },
    button: {
        all: 'unset',
        height: '1rem',
        cursor: 'pointer',
    },
    icon: {
        fontSize: '1rem',
    },
}));
