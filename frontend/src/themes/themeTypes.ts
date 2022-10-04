declare module '@mui/material/styles' {
    interface CustomTheme {
        /**
         * @deprecated
         */
        fontSizes: {
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
        };
    }

    interface CustomPalette {
        /**
         * Generic neutral palette color.
         */
        neutral: PaletteColorOptions;
        /**
         * Colors for event log output.
         */
        code: {
            main: string;
            diffAdd: string;
            diffSub: string;
            diffNeutral: string;
            edited: string;
        };
        /**
         * For 'Seen' column on feature toggles list and other.
         */
        activityIndicators: {
            unknown: string;
            recent: string;
            inactive: string;
            abandoned: string;
            primary: string;
        };
        dividerAlternative: string;
        contentWrapper: string;
        headerBackground: string;
        footerBackground: string;
        codebox: string;
        featureMetaData: string;
        playgroundBackground: string;
        playgroundFormBackground: string;
        standaloneBackground: string;
        standaloneBannerGradient: {
            from: string;
            to: string;
        };
        constraintAccordion: {
            editBackground: string;
            background: string;
            operatorBackground: string;
        };
        projectCard: {
            hover: string;
            textColor: string;
        };
        checkmarkBadge: string;
        inputLabelBackground: string;
        featureStrategySegmentChipBackground: string;
        featureSegmentSearchBackground: string;
        dialogHeaderBackground: string;
        dialogHeaderText: string;
        formSidebarTextColor: string;
        /**
         * For table header hover effect.
         */
        tableHeaderBackground: string;
        tableHeaderHover: string;
        tableHeaderColor: string;

        formBackground: string;
        formSidebar: string;
        /**
         * Text highlight effect color. Used when filtering/searching over content.
         */
        highlight: string;
        /**
         * Background color for secondary containers.
         */
        secondaryContainer: string;
        /**
         * Background color for sidebar containers.
         */
        sidebarContainer: string;
        /**
         * Icon that doesn't have an action (visual only, no click handler).
         *
         * @deprecated use `<YourIcon color="disabled" />`.
         * ⚠️ `color` only works with `import { YourIcon } from "@mui/icons"`
         * and not with `import YourIcon from "@mui/icons/YourIcon"`.
         */
        inactiveIcon: string;

        /** A border color used for contrast between similar backgroundColors **/
        lightBorder: string;

        /* Type for tertiary colors */
        tertiary: {
            main: string;
            light: string;
            dark: string;
            background: string;
            contrast: string;
        };
    }

    interface CustomTypeText {
        tertiaryContrast: string;
    }

    interface Theme extends CustomTheme {}
    interface ThemeOptions extends CustomTheme {}

    interface Palette extends CustomPalette {}
    interface PaletteOptions extends CustomPalette {}

    interface TypeText extends CustomTypeText {}

    interface PaletteColor {
        light: string;
        main: string;
        dark: string;
        border: string;
    }
    interface PaletteColorOptions {
        light?: string;
        main?: string;
        dark?: string;
        border?: string;
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

export {};
