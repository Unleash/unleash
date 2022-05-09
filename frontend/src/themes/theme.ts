import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

export default createTheme({
    boxShadows: {
        main: '0px 2px 4px rgba(129, 122, 254, 0.2)',
    },
    typography: {
        fontFamily: 'Sen, Roboto, sans-serif',
        fontWeightBold: '700',
        fontWeightMedium: '700',
        allVariants: { lineHeight: 1.4 },
        button: { lineHeight: 1.75 },
        h1: {
            fontSize: '1.5rem',
            lineHeight: 1.875,
        },
    },
    fontSizes: {
        mainHeader: '1.25rem',
        subHeader: '1.1rem',
        bodySize: '1rem',
        smallBody: '0.9rem',
        smallerBody: '0.8rem',
    },
    fontWeight: {
        thin: 300,
        medium: 400,
        semi: 700,
        bold: 700,
    },
    shape: {
        borderRadius: '3px',
        borderRadiusLarge: '10px',
        borderRadiusExtraLarge: '25px',
    },
    palette: {
        primary: {
            main: colors.purple[800],
            light: colors.purple[700],
            dark: colors.purple[900],
        },
        secondary: {
            main: colors.purple[800],
            light: colors.purple[700],
            dark: colors.purple[900],
        },
        info: {
            light: colors.blue[700],
            main: colors.blue[700],
            dark: colors.blue[800],
        },
        success: {
            light: colors.green[700],
            main: colors.green[700],
            dark: colors.green[800],
        },
        warning: {
            light: colors.orange[700],
            main: colors.orange[700],
            dark: colors.orange[800],
        },
        error: {
            light: colors.red[700],
            main: colors.red[700],
            dark: colors.red[800],
        },
        divider: colors.grey[300],
        dividerAlternative: colors.grey[500],
        grey: colors.grey,
        text: {
            primary: colors.grey[900],
            secondary: colors.grey[800],
            disabled: colors.grey[600],
        },
        code: {
            main: '#0b8c8f',
            diffAdd: 'green',
            diffSub: 'red',
            diffNeutral: 'black',
            edited: 'blue',
            background: '#efefef',
        },
        activityIndicators: {
            unknown: colors.grey[100],
            recent: colors.green[100],
            inactive: colors.orange[200],
            abandoned: colors.red[200],
        },
    },
    components: {
        MuiTableHead: {
            styleOverrides: {
                root: {
                    background: colors.grey[200],
                },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    color: colors.purple[900],
                },
            },
        },
        MuiBreadcrumbs: {
            styleOverrides: {
                root: {
                    '& a': {
                        color: colors.purple[900],
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&.MuiTableRow-hover:hover': {
                        background: colors.grey[100],
                    },
                },
            },
        },
    },
});
