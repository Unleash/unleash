import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    strategyCardHeaderContent: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    strategyCardHeader: {
        display: 'flex',
        background: theme.palette.primary.dark,
        color: '#fff',
        textAlign: 'left',
    },
    strategyCardHeaderTitle: {
        fontSize: theme.fontSizes.subHeader,
        maxWidth: '70%',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    strategyCardHeaderActions: {
        display: 'flex',
        color: '#fff',
    },
    strateyCardHeaderIcon: {
        color: '#fff',
    },
}));
