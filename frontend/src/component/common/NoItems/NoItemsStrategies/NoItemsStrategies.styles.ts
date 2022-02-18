import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    noItemsParagraph: {
        margin: '1rem 0',
    },
    link: {
        display: 'block',
        margin: '1rem 0 0 0',
    },
    envName: {
        position: 'relative',
        top: '6px',
        fontWeight: 'bold',
    },
}));
