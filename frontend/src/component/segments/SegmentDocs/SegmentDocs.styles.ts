import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    paragraph: {
        [theme.breakpoints.down('lg')]: {
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
