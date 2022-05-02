import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    noItemsParagraph: {
        margin: '1rem 0',
    },
    link: {
        display: 'block',
        margin: '1rem 0 0 0',
        color: 'inherit',
    },
    envName: {
        fontWeight: 'bold',
    },
}));
