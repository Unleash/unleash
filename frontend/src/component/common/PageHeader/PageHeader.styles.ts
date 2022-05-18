import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    headerContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    topContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    header: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginRight: theme.spacing(2),
    },
    headerTitle: {
        fontSize: theme.fontSizes.mainHeader,
        fontWeight: 'normal',
    },
    headerActions: {
        display: 'flex',
        flexGrow: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    verticalSeparator: {
        height: '100%',
        borderColor: theme.palette.dividerAlternative,
        width: '1px',
        display: 'inline-block',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(4),
        padding: '10px 0',
        verticalAlign: 'middle',
    },
}));
