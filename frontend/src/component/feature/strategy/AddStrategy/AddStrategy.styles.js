import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    createStrategyCardContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        '& > *': {
            marginRight: '0.5rem',
            marginTop: '0.5rem',
        },
    },
    subTitle: {
        fontWeight: theme.fontWeight.semi,
        margin: '1rem 0',
    },
}));
