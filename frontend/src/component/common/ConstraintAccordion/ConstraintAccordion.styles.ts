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
    accordion: {
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: '5px',
        backgroundColor: '#fff',
        boxShadow: 'none',
        margin: 0,
    },
    accordionRoot: {
        '&:before': {
            opacity: '0 !important',
        },
    },
    accordionEdit: {
        backgroundColor: '#F6F6FA',
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
    headerConstraintContainer: {
        minWidth: '220px',
        position: 'relative',
        paddingRight: '1rem',
        [theme.breakpoints.down(650)]: {
            paddingRight: 0,
        },
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
        whiteSpace: 'nowrap',
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
            height: '200px',
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
