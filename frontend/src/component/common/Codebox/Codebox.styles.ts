import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        backgroundColor: theme.palette.codebox,
        padding: '1rem',
        borderRadius: theme.shape.borderRadiusMedium,
        position: 'relative',
        maxHeight: '500px',
        overflow: 'auto',
    },
    code: {
        margin: 0,
        wordBreak: 'break-all',
        whiteSpace: 'pre-wrap',
        color: theme.palette.formSidebarTextColor,
        fontSize: 14,
    },
    icon: {
        fill: '#fff',
    },
    iconButton: {
        position: 'absolute',
        bottom: '10px',
        right: '20px',
    },
}));
