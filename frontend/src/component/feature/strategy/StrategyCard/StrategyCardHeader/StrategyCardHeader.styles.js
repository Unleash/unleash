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
        background: `linear-gradient(${theme.palette.cards.gradient.top}, ${theme.palette.cards.gradient.bottom})`,
        color: '#fff',
        textAlign: 'left',
    },
    strategyCardHeaderTitle: {
        fontSize: theme.fontSizes.subHeader,
    },
    strategyCardHeaderActions: {
        display: 'flex',
        color: '#fff',
    },
    strateyCardHeaderIcon: {
        color: '#fff',
    },
}));
