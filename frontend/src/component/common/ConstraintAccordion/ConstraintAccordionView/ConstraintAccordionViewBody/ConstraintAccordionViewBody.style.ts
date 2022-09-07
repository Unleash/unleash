import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    chip: {
        margin: '0 0.5rem 0.5rem 0',
    },
    chipValue: {
        whiteSpace: 'pre',
    },
    singleValueView: {
        display: 'flex',
        alignItems: 'center',
        [theme.breakpoints.down(600)]: { flexDirection: 'column' },
    },
    singleValueText: {
        marginRight: '0.75rem',
        [theme.breakpoints.down(600)]: {
            marginBottom: '0.75rem',
            marginRight: 0,
        },
    },
    settingsParagraph: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem 0',
    },
}));
