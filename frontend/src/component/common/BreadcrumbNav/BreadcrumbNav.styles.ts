import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    breadcrumbNav: {
        position: 'absolute',
        top: '4px',
    },
    breadcrumbNavParagraph: { textTransform: 'capitalize', color: 'inherit' },
    breadcrumbLink: {
        textTransform: 'capitalize',
        textDecoration: 'none',
    },
}));
