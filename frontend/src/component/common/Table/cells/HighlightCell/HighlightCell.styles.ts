import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        wordBreak: 'break-word',
        padding: theme.spacing(1, 2),
    },
    title: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: '1',
        lineClamp: '1',
    },
    subtitle: {
        color: theme.palette.text.secondary,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: 'inherit',
        WebkitLineClamp: '1',
        lineClamp: '1',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
    },
}));
