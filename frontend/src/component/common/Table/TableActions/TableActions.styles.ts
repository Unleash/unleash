import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tableActions: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        '&>button': {
            padding: theme.spacing(1),
            flexShrink: 0,
        },
        paddingRight: theme.spacing(1),
    },
    fieldWidth: {
        width: '45px',
        '& .search-icon': {
            marginRight: 0,
        },
        '& .input-container, .clear-container': {
            width: 0,
        },
        '& input::placeholder': {
            color: 'transparent',
            transition: 'color 0.6s',
        },
        '& input:focus-within::placeholder': {
            color: theme.palette.text.primary,
        },
    },
    fieldWidthEnter: {
        width: '250px',
        transition: 'width 0.6s',
        '& .search-icon': {
            marginRight: '8px',
        },
        '& .input-container': {
            width: '100%',
            transition: 'width 0.6s',
        },
        '& .clear-container': {
            width: '30px',
            transition: 'width 0.6s',
        },
        '& .search-container': {
            borderColor: theme.palette.grey[300],
        },
    },
    fieldWidthLeave: {
        width: '45px',
        transition: 'width 0.6s',
        '& .search-icon': {
            marginRight: 0,
            transition: 'margin-right 0.6s',
        },
        '& .input-container, .clear-container': {
            width: 0,
            transition: 'width 0.6s',
        },
        '& .search-container': {
            borderColor: 'transparent',
        },
    },
    verticalSeparator: {
        height: '100%',
        backgroundColor: theme.palette.grey[500],
        width: '1px',
        display: 'inline-block',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(4),
        padding: '10px 0',
        verticalAlign: 'middle',
    },
}));
