import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
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
