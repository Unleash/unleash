import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#607d8b',
            light: '#B2DFDB',
            dark: '#00796B',
        },
        secondary: {
            main: '#217584',
        },
        neutral: {
            main: '#18243e',
        },
        icons: {
            lightGrey: '#e0e0e0',
        },
        chips: {
            main: '#b0bec5',
        },
        searchField: {
            main: '#fff',
        },
        iconButtons: {
            main: '#fff',
        },
        tabs: {
            main: '#efefef',
        },
        links: {
            deprecated: '#1d1818',
        },
        error: {
            main: '#d95e5e',
        },
        success: {
            main: '#3bd86e',
        },
        division: {
            main: '#f1f1f1',
        },
        cards: {
            gradient: {
                top: '#617D8B',
                bottom: '#31627C',
            },
            container: {
                bg: '#f1f1f1',
            },
        },
    },
    padding: {
        pageContent: {
            header: '1.8rem 2rem',
            body: '2rem',
        },
    },
    borders: {
        default: '1px solid #f1f1f1',
        radius: { main: '3px' },
    },
    fontSizes: {
        mainHeader: '1.1rem',
    },
    boxShadows: {
        chip: {
            main: `0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12)`,
        },
    },
    fontWeight: {
        thin: '300',
        medium: '400',
        semi: '500',
        bold: '600',
    },
});

export default theme;
