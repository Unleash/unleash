import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    paragraph: {
        [theme.breakpoints.down('md')]: {
            display: 'inline',
            '&:after': {
                content: '" "',
            },
        },
        [theme.breakpoints.up('md')]: {
            display: 'block',
            '& + &': {
                marginTop: '0.25rem',
            },
        },
    },
}));
