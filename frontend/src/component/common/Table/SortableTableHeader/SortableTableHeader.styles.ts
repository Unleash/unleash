import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tableHeader: {
        '& > th': {
            border: 0,
            '&:first-of-type': {
                borderTopLeftRadius: theme.shape.borderRadiusMedium,
                borderBottomLeftRadius: theme.shape.borderRadiusMedium,
            },
            '&:last-of-type': {
                borderTopRightRadius: theme.shape.borderRadiusMedium,
                borderBottomRightRadius: theme.shape.borderRadiusMedium,
            },
        },
    },
}));
