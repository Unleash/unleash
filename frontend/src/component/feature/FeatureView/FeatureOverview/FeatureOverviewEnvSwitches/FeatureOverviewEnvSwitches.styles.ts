import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        borderRadius: theme.shape.borderRadiusLarge,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        maxWidth: '350px',
        minWidth: '350px',
        marginRight: '1rem',
        marginTop: '1rem',
        [theme.breakpoints.down(1000)]: {
            marginBottom: '1rem',
            width: '100%',
            maxWidth: 'none',
            minWidth: 'auto',
        },
    },
    header: {
        fontSize: theme.fontSizes.subHeader,
        fontWeight: 'normal',
        margin: 0,
        marginBottom: '0.5rem',
    },
}));
