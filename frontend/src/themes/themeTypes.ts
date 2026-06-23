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
            flagMetrics: {
                enabled: string;
                notEnabled: string;
            };
        };

        inverse: {
            main: string;
            contrastText: string;
        };

        /**
         * Syntax highlighting colors for code examples (e.g. SDK onboarding snippets).
         * Use these tokens in any component that renders highlighted code so the
         * colour choices are centralised and adapt to light / dark mode.
         */
        codeHighlighting: {
            /** Control-flow and reserved words: if, for, return, const, … */
            keyword: string;
            /** CSS selector tag names */
            selectorTag: string;
            /** String literals, template expressions, and doc-comment tags */
            string: string;
            /** Numeric literals */
            number: string;
            /** Boolean/null/undefined literals */
            literal: string;
            /** Inline and block comments */
            comment: string;
            /** Language built-ins: console, print, len, … */
            builtIn: string;
            /** Function names at their definition or call site */
            title: string;
            /** Class names (e.g. UnleashConfig in UnleashConfig.builder()) */
            class_: string;
            /** Type annotations and generic parameters */
            type: string;
            /** HTML / XML attribute names and object keys */
            attr: string;
            /** Variable references */
            variable: string;
            /** HTML / XML tag names */
            tag: string;
            /** Preprocessor directives, decorators, and other metadata */
            meta: string;
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
        borderRadiusSmall: number;
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

/*
 * Design system v2: inputs and selects share the button height scale
 * (small/medium/large, see themes/controls.ts). MUI only types
 * 'small' | 'medium' for inputs, so allow 'large' as well.
 */
declare module '@mui/material/InputBase' {
    interface InputBasePropsSizeOverrides {
        large: true;
    }
}
declare module '@mui/material/TextField' {
    interface TextFieldPropsSizeOverrides {
        large: true;
    }
}
declare module '@mui/material/FormControl' {
    interface FormControlPropsSizeOverrides {
        large: true;
    }
}
declare module '@mui/material/Autocomplete' {
    interface AutocompletePropsSizeOverrides {
        large: true;
    }
}
declare module '@mui/material/InputLabel' {
    interface InputLabelPropsSizeOverrides {
        large: true;
    }
}
