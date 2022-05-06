import { SimplePaletteColorOptions } from '@mui/material';

declare module '@mui/material/styles' {
    interface CustomTheme {
        /**
         * @deprecated
         */
        fontSizes: {
            mainHeader: string;
            subHeader: string;
            bodySize: string;
            smallBody: string;
            smallerBody: string;
        };
        /**
         * @deprecated
         */
        fontWeight: {
            thin: number;
            medium: number;
            semi: number;
            bold: number;
        };
        /**
         * @deprecated
         */
        code: {
            main: string;
            diffAdd: string;
            diffSub: string;
            diffNeutral: string;
            edited: string;
            background: string;
        };
        /**
         * @deprecated
         */
        borderRadius: {
            main: string;
        };
        /**
         * @deprecated
         */
        boxShadows: {
            main: string;
        };
    }

    interface CustomPalette {
        /**
         * @deprecated
         */
        chips: SimplePaletteColorOptions;
        /**
         * @deprecated
         */
        searchField: SimplePaletteColorOptions;
        /**
         * @deprecated
         */
        iconButtons: SimplePaletteColorOptions;
        /**
         * @deprecated
         */
        tabs: SimplePaletteColorOptions;
        /**
         * @deprecated
         */
        division: SimplePaletteColorOptions;
        /**
         * @deprecated
         */
        footer: SimplePaletteColorOptions;
    }

    interface Theme extends CustomTheme {}
    interface ThemeOptions extends CustomTheme {}

    interface Palette extends CustomPalette {}
    interface PaletteOptions extends CustomPalette {}
}
