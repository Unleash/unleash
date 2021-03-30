import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    strategyCardHeaderContent: {
        width: '100%',
    },
    strategyCardHeader: {
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(${theme.palette.cards.gradient.top}, ${theme.palette.cards.gradient.bottom})`,
        color: '#fff',
        textAlign: 'center',
        width: '100%',
    },
    strategyCardHeaderTitle: {
        fontWeight: 'bold',
        fontSize: theme.fontSizes.mainHeader,
        marginBottom: '0.7rem',
    },
    strategyCardHeaderActions: {
        display: 'flex',
        justifyContent: 'space-between',
        color: '#fff',
    },
    strateyCardHeaderIcon: {
        color: '#fff',
    },
}));
