import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    constraintIconContainer: {
        backgroundColor: theme.palette.primary.main,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing(1),
        [theme.breakpoints.down(650)]: {
            marginBottom: '1rem',
            marginRight: 0,
        },
    },
    constraintIcon: {
        fill: '#fff',
    },
    accordion: {
        border: `1px solid ${theme.palette.grey[400]}`,
        borderRadius: theme.spacing(1),
        backgroundColor: '#fff',
        boxShadow: 'none',
        margin: 0,
    },
    accordionRoot: {
        '&:before': {
            opacity: '0 !important',
        },
    },
    headerMetaInfo: {
        display: 'flex',
        alignItems: 'stretch',
        [theme.breakpoints.down(710)]: { flexDirection: 'column' },
    },
    headerContainer: {
        display: 'flex',
        alignItems: 'center',
        [theme.breakpoints.down(710)]: {
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
        },
    },
    headerValuesContainerWrapper: {
        display: 'flex',
        alignItems: 'stretch',
        margin: 'auto 0',
    },
    headerValuesContainer: {
        display: 'flex',
        justifyContent: 'stretch',
        margin: 'auto 0',
        flexDirection: 'column',
    },
    headerValues: {
        fontSize: theme.fontSizes.smallBody,
    },
    headerValuesExpand: {
        fontSize: theme.fontSizes.smallBody,
        marginTop: '4px',
        color: theme.palette.primary.dark,
        [theme.breakpoints.down(710)]: {
            textAlign: 'center',
        },
    },
    headerConstraintContainer: {
        minWidth: '220px',
        position: 'relative',
        paddingRight: '1rem',
        [theme.breakpoints.between(1101, 1365)]: {
            minWidth: '152px',
            paddingRight: '0.5rem',
        },
    },
    headerText: {
        maxWidth: '400px',
        fontSize: theme.fontSizes.smallBody,
        [theme.breakpoints.down('xl')]: {
            display: 'none',
        },
    },
    chip: {
        margin: '0 0.5rem 0.5rem 0',
    },
    chipValue: {
        whiteSpace: 'pre',
    },
    accordionDetails: {
        borderTop: `1px dashed ${theme.palette.grey[300]}`,
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
        padding: theme.spacing(0.5, 3),
        '&:hover .valuesExpandLabel': {
            textDecoration: 'underline',
        },
    },
}));
