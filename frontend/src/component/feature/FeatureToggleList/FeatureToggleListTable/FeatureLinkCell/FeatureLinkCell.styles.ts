import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    wrapper: {
        paddingTop: theme.spacing(1.5),
        paddingBottom: theme.spacing(1.5),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        minHeight: '62px',
        '&:hover, &:focus': {
            textDecoration: 'none',
            '& > div > span:first-of-type': {
                textDecoration: 'underline',
            },
        },
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        wordBreak: 'break-all',
    },
    description: {
        color: theme.palette.grey[800],
        textDecoration: 'none',
        fontSize: 'inherit',
        display: 'inline-block',
    },
}));
