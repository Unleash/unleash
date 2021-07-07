import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    pagination: {
        margin: '1rem 0 0 0',
        display: 'flex',
        justifyContent: ' center',
        position: 'absolute',
        bottom: '25px',
        right: '0',
        left: '0',
    },
    paginationInnerContainer: {
        position: 'relative',
    },
    paginationButton: {
        border: 'none',
        cursor: 'pointer',
        backgroundColor: 'efefef',
        margin: '0 0.2rem',
        borderRadius: '3px',
        padding: '0.25rem 0.5rem',
    },
    paginationButtonActive: {
        backgroundColor: '#635DC5',
        color: '#fff',
        transition: 'backgroundColor 0.3s ease',
    },
    idxBtn: {
        border: 'none',
        borderRadius: '3px',
        background: 'transparent',
        position: 'absolute',
        height: '23px',
        cursor: 'pointer',
    },
    idxBtnIcon: {
        height: '15px',
        width: '15px',
    },
    idxBtnLeft: {
        left: '-30px',
    },
    idxBtnRight: {
        right: '-30px',
    },
}));
