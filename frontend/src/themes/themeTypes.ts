// biome-ignore lint: we need this to correctly extend the MUI theme
import { FormHelperTextOwnProps } from '@mui/material/FormHelperText';

declare module '@mui/material/styles' {
    interface CustomTheme {
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

    interface CustomPalette {
        /**
         * Generic neutral palette color
         */
        neutral: PaletteColorOptions;

        /**
         * Sales-related palette color
         */
        web: PaletteColorOptions;

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
         * For Environment Accordion
         */
        envAccordion: {
            disabled: string;
            expanded: string;
        };

        /**
         * Variants, percentage split in strategies
         **/
        variants: string[];

        /**
         * Dashboard and charts
         */
        charts: {
            gauge: {
                gradientStart: string;
                gradientEnd: string;
                background: string;
                sectionLine: string;
                text: string;
            };
            health: {
                mainCircleBackground: string;
                orbit: string;
                circles: string;
                text: string;
                title: string;
                healthy: string;
                stale: string;
                potentiallyStale: string;
                gradientStale: string;
                gradientPotentiallyStale: string;
            };
            series: string[];
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

    /* Extend the background object from MUI */
    interface CustomTypeBackground {
        application: string;
        sidebar: string;
        alternative: string;
        elevation1: string;
        elevation2: string;
    }

    interface PaletteColor {
        main: string;
        light: string;
        dark: string;
        border?: string;
        contrastText: string;
    }
    interface PaletteColorOptions {
        main?: string;
        light?: string;
        dark?: string;
        border?: string;
        contrastText?: string;
    }
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
