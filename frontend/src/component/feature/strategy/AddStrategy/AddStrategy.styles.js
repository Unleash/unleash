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
        fontSize: theme.fontSizes.subHeader,
        margin: '2rem 0 0.5rem 0',
    },
}));
