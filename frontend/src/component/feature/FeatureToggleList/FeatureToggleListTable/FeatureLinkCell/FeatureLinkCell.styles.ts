import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        paddingTop: theme.spacing(1.5),
        paddingBottom: theme.spacing(1.5),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        minHeight: '62px',
    },
    description: {
        color: theme.palette.grey[800],
        fontSize: 'inherit',
        display: 'inline-block',
        maxWidth: '250px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
}));
