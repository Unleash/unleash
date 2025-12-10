// biome-ignore lint: we need this to correctly extend the MUI theme
import { FormHelperTextOwnProps } from '@mui/material/FormHelperText';

declare module '@mui/material/styles' {
    interface CustomTheme {
        mode: 'light' | 'dark';
        /**
         * @deprecated
         */
        fontSizes: {
            extraLargeHeader: string;
            largeHeader: string;
            mediumHeader: string;
            mainHeader: string;
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
        boxShadows: {
            main: string;
            card: string;
            elevated: string;
            popup: string;
            primaryHeader: string;
            separator: string;
            accordionFooter: string;
            reverseFooter: string;
        };
    }

    interface PaletteColor {
        border?: string;
    }

    interface SimplePaletteColorOptions {
        border?: string;
    }

    interface CustomTypeBackground {
        application: string;
        sidebar: string;
        alternative: string;
        elevation1: string;
        elevation2: string;
    }

    interface CustomPalette {
        /**
         * Generic neutral palette color
         */
        neutral: SimplePaletteColorOptions;

        /**
         * Sales-related palette color
         */
        web: SimplePaletteColorOptions;

        /**
         * Table colors
         */
        table: {
            headerBackground: string;
            headerHover: string;
            divider: string;
            rowHover: string;
        };

        /**
         * Colors for event log output
         */
        eventLog: {
            diffAdd: string;
            diffSub: string;
            edited: string;
        };

        /**
         * For 'Seen' column on feature flags list and other
         */
        seen: {
            unknown: string;
            recent: string;
            inactive: string;
            abandoned: string;
            primary: string;
        };

        /**
         * Background color for the API command in the sidebar
         */
        codebox: string;

        /**
         * Gradient for the login page
         */
        loginGradient: {
            from: string;
            to: string;
        };

        /**
         * Text highlight effect color. Used when filtering/searching over content
         */
        highlight: string;

        /**
         * Used for the interactive guide spotlight
         */
        spotlight: {
            border: string;
            outline: string;
            pulse: string;
        };

        /**
         * For Links
         */
        links: string;

        /**
         * Variants, percentage split in strategies
         **/
        variants: string[];

        /**
         * Dashboard and charts
         */
        charts: {
            A1: string;
            A2: string;
            A3: string;
            A4: string;
            B1: string;
            C1: string;
            D1: string;
            E1: string;
            series: string[];
        };

        inverse: {
            main: string;
            contrastText: string;
        };
    }
    interface Theme extends CustomTheme {}
    interface ThemeOptions extends CustomTheme {}

    interface Palette extends CustomPalette {}
    interface PaletteOptions extends CustomPalette {}
    interface TypeBackground extends CustomTypeBackground {}

    /* Extend the action object from MUI */
    interface CustomTypeAction {
        /**
         * Add background color on hover for the interactive elements
         * that use the alternative primary color. First used to add
         * hover colors to button group elements
         **/
        alternative: string;
    }

    interface TypeAction extends CustomTypeAction {}
}

declare module '@mui/system/createTheme/shape' {
    interface Shape {
        borderRadiusMedium: number;
        borderRadiusLarge: number;
        borderRadiusExtraLarge: number;
        tableRowHeight: number;
        tableRowHeightCompact: number;
        tableRowHeightDense: number;
    }
}
declare module '@mui/material/styles/zIndex' {
    interface ZIndex {
        sticky: number;
    }
}
declare module '@mui/material' {
    interface ButtonPropsColorOverrides {
        web: true;
    }
}
declare module '@mui/material/FormHelperText' {
    interface FormHelperTextOwnProps {
        'data-testid'?: string;
    }
}
