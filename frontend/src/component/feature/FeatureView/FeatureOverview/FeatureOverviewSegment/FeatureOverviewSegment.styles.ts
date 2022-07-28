import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        width: '100%',
        padding: theme.spacing(2, 3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontSize: theme.fontSizes.smallBody,
        border: `1px solid ${theme.palette.dividerAlternative}`,
        position: 'relative',
        borderRadius: '5px',
    },
    link: {
        textDecoration: 'none',
        marginLeft: theme.spacing(1),
        '&:hover': {
            textDecoration: 'underline',
        },
    },
}));
