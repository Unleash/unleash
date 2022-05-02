import { createTheme } from '@mui/material/styles';

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
            main: '#635DC5',
            light: '#817AFE',
            dark: '#635DC5',
        },
        secondary: {
            main: '#635DC5',
            light: '#817AFE',
            dark: '#635DC5',
        },
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
        error: {
            main: '#d95e5e',
        },
        success: {
            main: '#3bd86e',
        },
        division: {
            main: '#f1f1f1',
        },
        footer: {
            main: '#000',
        },
    },
});
