import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    accordionBodyInnerContainer: {
        [theme.breakpoints.down(400)]: {
            padding: '0.5rem',
        },
    },
    accordionBody: {
        width: '100%',
        position: 'relative',
        paddingBottom: '1rem',
    },
}));
