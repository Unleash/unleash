import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    constraintIconContainer: {
        backgroundColor: theme.palette.primary.main,
        height: '28px',
        width: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '2rem',
        [theme.breakpoints.down(650)]: {
            marginBottom: '1rem',
            marginRight: 0,
        },
    },
    constraintIcon: {
        fill: '#fff',
        width: '26px',
        height: '26px',
    },
    accordionRoot: { margin: 0, boxShadow: 'none' },
    negated: {
        position: 'absolute',
        color: '#fff',
        backgroundColor: theme.palette.primary.light,
        padding: '0.1rem 0.2rem',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        top: '-15px',
        left: '42px',
        borderRadius: '3px',
    },
    accordion: {
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: '5px',
        backgroundColor: '#fff',
        margin: 0,

        ['&:before']: {
            height: 0,
        },
    },
    accordionEdit: {
        backgroundColor: '#F6F6FA',
    },
    operator: {
        border: `1px solid ${theme.palette.secondary.main}`,
        padding: '0.25rem 1rem',
        color: theme.palette.secondary.main,
        textTransform: 'uppercase',
        borderRadius: '5px',
        margin: '0rem 2rem',
        fontSize: theme.fontSizes.smallBody,
    },
    headerMetaInfo: {
        display: 'flex',
        alignItems: 'center',
        [theme.breakpoints.down(710)]: { flexDirection: 'column' },
    },
    headerContainer: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        [theme.breakpoints.down(650)]: {
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
        },
    },
    headerValuesContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    headerValues: {
        fontSize: theme.fontSizes.smallBody,
        color: theme.palette.primary.light,
    },
    headerValuesExpand: {
        fontSize: theme.fontSizes.smallBody,
    },
    headerViewValuesContainer: {
        [theme.breakpoints.down(990)]: {
            display: 'none',
        },
    },
    editingBadge: {
        borderRadius: '25px',
        padding: '0.25rem 0.5rem',
        backgroundColor: '#635DC5',
        color: '#fff',
        marginLeft: 'auto',
        fontSize: '0.9rem',
        [theme.breakpoints.down(650)]: {
            position: 'absolute',
            right: 0,
            top: '-10px',
        },
    },
    help: {
        fill: theme.palette.grey[600],
        [theme.breakpoints.down(860)]: {
            display: 'none',
        },
    },
    headerText: {
        maxWidth: '400px',
        fontSize: theme.fontSizes.smallBody,
        [theme.breakpoints.down(1260)]: {
            display: 'none',
        },
    },
    selectContainer: {
        display: 'flex',
        alignItems: 'center',
        [theme.breakpoints.down(770)]: {
            flexDirection: 'column',
        },
    },
    bottomSelect: {
        [theme.breakpoints.down(770)]: {
            marginTop: '1rem',
        },
    },
    headerSelect: { marginRight: '2rem', width: '200px' },
    chip: {
        margin: '0 0.5rem 0.5rem 0',
    },
    chipValue: {
        whiteSpace: 'pre',
    },
    headerActions: {
        marginLeft: 'auto',
        [theme.breakpoints.down(660)]: {
            marginLeft: '0',
            marginTop: '0.5rem',
        },
    },
    accordionDetails: {
        borderTop: `1px solid ${theme.palette.grey[300]}`,
        display: 'flex',
        flexDirection: 'column',
    },
    valuesContainer: {
        padding: '1rem 0rem',
        maxHeight: '400px',
        overflowY: 'auto',
    },
    summary: {
        border: 'none',
        padding: '0.25rem 1rem',
        height: '85px',
        [theme.breakpoints.down(770)]: {
            height: '175px',
        },
    },
    settingsParagraph: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem 0',
    },
    settingsIcon: {
        height: '32.5px',
        width: '32.5px',
        marginRight: '0.5rem',
        fill: theme.palette.grey[600],
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
    form: { padding: 0, margin: 0, width: '100%' },
}));
