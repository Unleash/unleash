import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'flex',
        padding: theme.spacing(1.5),
    },
    box: {
        width: '38px',
        height: '38px',
        background: 'gray',
        borderRadius: '4px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: theme.fontSizes.smallerBody,
        margin: '0 auto',
    },
}));
