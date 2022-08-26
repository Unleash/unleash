import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        borderRadius: theme.shape.borderRadiusLarge,
        color: '#fff',
        backgroundColor: theme.palette.featureMetaData,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '350px',
        minWidth: '350px',
        marginRight: '1rem',
        [theme.breakpoints.down(1000)]: {
            width: '100%',
            maxWidth: 'none',
            minWidth: 'auto',
        },
    },
    paddingContainerTop: {
        padding: '1.5rem 1.5rem 0 1.5rem',
    },
    paddingContainerBottom: {
        padding: '0 1.5rem 1.5rem 1.5rem',
        borderTop: `1px solid ${theme.palette.grey[300]}`,
    },
    metaDataHeader: {
        display: 'flex',
        alignItems: 'center',
    },
    header: {
        fontSize: theme.fontSizes.bodySize,
        fontWeight: 'normal',
        margin: 0,
    },
    body: {
        margin: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
    },
    bodyItem: {
        margin: '0.5rem 0',
        fontSize: theme.fontSizes.bodySize,
        wordBreak: 'break-all',
    },
    headerIcon: {
        marginRight: '1rem',
        height: '40px',
        width: '40px',
        fill: '#fff',
    },
    descriptionContainer: {
        display: 'flex',
        alignItems: 'center',
        color: '#fff',
    },
    editIcon: {
        color: '#fff',
    },
}));
