import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    searchField: {
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
    searchFieldEnter: {
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
    searchFieldLeave: {
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
    searchButton: {
        marginTop: '-4px',
        marginBottom: '-4px',
        marginRight: '-4px',
        marginLeft: '-4px',
    },
}));
