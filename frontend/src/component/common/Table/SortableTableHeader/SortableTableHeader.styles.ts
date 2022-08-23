import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tableHeader: {
        '& > th': {
            height: theme.shape.tableRowHeightCompact,
            border: 0,
            backgroundColor: theme.palette.tableHeaderBackground,
            color: theme.palette.tableHeaderColor,
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
