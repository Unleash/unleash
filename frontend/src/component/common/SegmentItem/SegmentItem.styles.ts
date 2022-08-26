import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        width: '100%',
        padding: theme.spacing(2, 3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontSize: theme.fontSizes.smallBody,
        border: `1px solid ${theme.palette.dividerAlternative}`,
        position: 'relative',
        borderRadius: '5px',
    },
    link: {
        textDecoration: 'none',
        marginLeft: theme.spacing(1),
        '&:hover': {
            textDecoration: 'underline',
        },
    },
    accordion: {
        border: `1px solid ${theme.palette.dividerAlternative}`,
        borderRadius: theme.shape.borderRadiusMedium,
        backgroundColor: '#fff',
        boxShadow: 'none',
        margin: 0,
    },
    accordionRoot: {
        transition: 'all 0.1s ease',
    },
    accordionExpanded: {
        backgroundColor: theme.palette.neutral.light,
    },
    previewButton: {
        paddingTop: 0,
        paddingBottom: 0,
        marginLeft: 'auto',
        fontSize: theme.fontSizes.smallBody,
    },
    summary: {
        fontSize: theme.fontSizes.smallBody,
        margin: theme.spacing(0.5, 0),
    },
}));
