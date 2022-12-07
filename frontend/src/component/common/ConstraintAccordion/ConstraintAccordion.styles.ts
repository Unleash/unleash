import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    constraintIconContainer: {
        backgroundColor: theme.palette.background.paper,
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
        border: `1px solid ${theme.palette.dividerAlternative}`,
        borderRadius: theme.shape.borderRadiusMedium,
        backgroundColor: theme.palette.constraintAccordion.background,
        boxShadow: 'none',
        margin: 0,
    },
    accordionRoot: {
        '&:before': {
            opacity: '0 !important',
        },
    },
    accordionEdit: {
        backgroundColor: theme.palette.constraintAccordion.editBackground,
    },
    headerMetaInfo: {
        display: 'flex',
        alignItems: 'stretch',
        marginLeft: theme.spacing(1),
        [theme.breakpoints.down(710)]: {
            marginLeft: 0,
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
        },
    },
    headerContainer: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
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
        marginLeft: theme.spacing(1),
        [theme.breakpoints.down(710)]: {
            marginLeft: 0,
        },
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
        minWidth: '152px',
        position: 'relative',
        [theme.breakpoints.down(710)]: {
            paddingRight: 0,
        },
    },
    editingBadge: {
        borderRadius: theme.shape.borderRadiusExtraLarge,
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
    headerText: {
        maxWidth: '400px',
        fontSize: theme.fontSizes.smallBody,
        [theme.breakpoints.down('xl')]: {
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
        display: 'inline-flex',
    },
    headerSelect: {
        marginRight: '1rem',
        width: '200px',
        [theme.breakpoints.between(1101, 1365)]: {
            width: '170px',
            marginRight: '8px',
        },
    },
    chip: {
        margin: '0 0.5rem 0.5rem 0',
    },
    chipValue: {
        whiteSpace: 'pre',
    },
    headerActions: {
        marginLeft: 'auto',
        whiteSpace: 'nowrap',
        [theme.breakpoints.down(710)]: {
            display: 'none',
        },
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
    settingsIcon: {
        height: '32.5px',
        width: '32.5px',
        marginRight: '0.5rem',
        fill: theme.palette.inactiveIcon,
    },
    form: { padding: 0, margin: 0, width: '100%' },
}));
