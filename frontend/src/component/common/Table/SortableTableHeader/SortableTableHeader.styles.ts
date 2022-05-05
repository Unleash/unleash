import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tableHeader: {
        '& > th': {
            border: 0,
            '&:first-of-type': {
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px',
            },
            '&:last-of-type': {
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
            },
        },
    },
    icon: {
        marginLeft: theme.spacing(0.5),
        fontSize: 18,
    },
}));
