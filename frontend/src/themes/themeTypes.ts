import { SimplePaletteColorOptions } from '@mui/material';

declare module '@mui/material/styles' {
    interface CustomTheme {
        fontSizes: {
            mainHeader: string;
            subHeader: string;
            bodySize: string;
            smallBody: string;
            smallerBody: string;
        };
        fontWeight: {
            thin: number;
            medium: number;
            semi: number;
            bold: number;
        };
        code: {
            main: string;
            diffAdd: string;
            diffSub: string;
            diffNeutral: string;
            edited: string;
            background: string;
        };
        borderRadius: {
            main: string;
        };
        boxShadows: {
            main: string;
        };
    }

    interface CustomPalette {
        neutral: SimplePaletteColorOptions;
        chips: SimplePaletteColorOptions;
        searchField: SimplePaletteColorOptions;
        iconButtons: SimplePaletteColorOptions;
        tabs: SimplePaletteColorOptions;
        division: SimplePaletteColorOptions;
        footer: SimplePaletteColorOptions;
    }

    interface Theme extends CustomTheme {}
    interface ThemeOptions extends CustomTheme {}

    interface Palette extends CustomPalette {}
    interface PaletteOptions extends CustomPalette {}
}
