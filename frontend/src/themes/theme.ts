import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

export default createTheme({
    borderRadius: {
        main: '3px',
    },
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
        mainHeader: '1.2rem',
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
    code: {
        main: '#0b8c8f',
        diffAdd: 'green',
        diffSub: 'red',
        diffNeutral: 'black',
        edited: 'blue',
        background: '#efefef',
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
        grey: colors.grey,
        neutral: {
            main: '#18243e',
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
        success: {
            light: colors.green[100],
            main: colors.green[700],
            dark: colors.green[800],
        },
        warning: {
            light: colors.orange[200],
            main: colors.orange[700],
            dark: colors.orange[800],
        },
        error: {
            light: colors.red[200],
            main: colors.red[700],
            dark: colors.red[800],
        },
        division: {
            main: '#f1f1f1',
        },
        footer: {
            main: '#000',
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
    },
});
