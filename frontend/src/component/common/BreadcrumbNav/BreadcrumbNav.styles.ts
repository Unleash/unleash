import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    breadcrumbNav: {
        position: 'absolute',
        top: '4px',
    },
    breadcrumbNavParagraph: {
        color: 'inherit',
        '& > *': {
            verticalAlign: 'middle',
        },
    },
    breadcrumbLink: {
        textDecoration: 'none',
        '& > *': {
            verticalAlign: 'middle',
        },
        color: theme.palette.primary.main,
    },
}));
