import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';
import { focusable } from 'themes/themeStyles';

const actionColors = {
    0.54: 'rgba(223, 222, 255, 0.54)',
    0.32: 'rgba(223, 222, 255, 0.32)',
    0.12: 'rgba(223, 222, 255, 0.12)',
    0.08: 'rgba(223, 222, 255, 0.08)',
    0.05: 'rgba(223, 222, 255, 0.05)',
};

const theme = {
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1260,
            xl: 1536,
        },
    },
    boxShadows: {
        main: '0px 2px 4px rgba(129, 122, 254, 0.2)',
        card: '0px 2px 10px rgba(28, 25, 78, 0.12)',
        elevated: '0px 1px 20px rgba(45, 42, 89, 0.1)',
        popup: '0px 2px 6px rgba(0, 0, 0, 0.25)',
        primaryHeader: '0px 8px 24px rgba(97, 91, 194, 0.2)',
        separator: '0px 2px 4px rgba(32, 32, 33, 0.12)', // Notifications header
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
        h2: {
            fontSize: `${20 / 16}rem`,
            fontWeight: '700',
        },
        h3: {
            fontSize: '1rem',
            fontWeight: '700',
        },
        caption: {
            fontSize: `${12 / 16}rem`,
        },
    },
    fontSizes: {
        largeHeader: '2rem',
        mainHeader: '1.25rem',
        bodySize: '1rem',
        smallBody: `${14 / 16}rem`,
        smallerBody: `${12 / 16}rem`,
    },
    fontWeight: {
        thin: 300,
        medium: 400,
        semi: 700,
        bold: 700,
    },
    shape: {
        borderRadius: 4,
        borderRadiusMedium: 8,
        borderRadiusLarge: 12,
        borderRadiusExtraLarge: 20,
        tableRowHeight: 64,
        tableRowHeightCompact: 56,
        tableRowHeightDense: 48,
    },
    zIndex: {
        sticky: 1400,
    },

    palette: {
        common: {
            white: '#EEEEFC', // Switch base (OFF) // Tooltips text color // Text color
            black: '#A0A0B1', // Switch track (OFF)
        },
        text: {
            primary: '#EEEEFC',
            secondary: '#A0A0B1',
            disabled: '#888799',
        },
        primary: {
            main: '#9792ED',
            light: '#4C4992',
            // Maybe to move links color to another variable????
            dark: '#9792ED', // Color used for links and on hover for primary buttons
            contrastText: '#EEEEFC', // Color used for content when primary.main is used as a background
        },
        secondary: {
            // Used for purple badges and puple light elements
            main: '#9792ED', // used on icons on these elements
            light: '#34325E', // used as a bakground on these elements
            dark: '#EEEEFC', // used for text on these elements
            border: '#4C4992',
            contrastText: '#EEEEFC', // Color used for content when info.main is used as a background
        },
        info: {
            // main: '#5483C9',  // used on icons on these elements
            main: '#a2bbe2', // used on icons on these elements
            light: '#1A2641', // used as a bakground on these elements
            dark: '#a2bbe2', // used for text on these elements
            border: '#1B407A',
            contrastText: '#EEEEFC', // Color used for content when info.main is used as a background
        },
        success: {
            // main: '#62872F',  // used on icons on these elements
            main: '#94ae6f', // used on icons on these elements
            light: '#333D30', // used as a bakground on these elements
            dark: '#94ae6f', // used for text on these elements
            border: '#3D600C',
            contrastText: '#EEEEFC', // Color used for content when success.main is used as a background
        },
        warning: {
            // main: '#9E691C',  // used on icons on these elements
            main: '#bc7d21', // used on icons on these elements
            light: '#3B302C', // used as a bakground on these elements
            dark: '#bc7d21', // used for text on these elements
            contrastText: '#EEEEFC', // Color used for content when warning.main is used as a background
            border: '#6C4A19',
        },
        error: {
            // main: '#B93F4A',  // used on error buttons // used on icons on these elements
            main: '#ff6472', // used on error buttons // used on icons on these elements
            light: '#3F2835', // used as a bakground on these elements
            // dark: '#F15260',  // used for text on these elements
            dark: '#ff6472', // used for text on these elements
            border: '#8A3E45',
            contrastText: '#EEEEFC', // Color used for content when error.main is used as a background
        },
        web: {
            main: '#1A4049', // used on sales-related elements
            contrastText: '#EEEEFC', // Color used for inner text
        },

        /**
         *  Used for grey badges, hover elements, and grey light elements
         */
        neutral: {
            main: '#858699', // used on icons on these elements
            light: '#2B2A3C', // used as a bakground on these elements
            dark: '#EEEEFC', // used for text on these elements
            border: '#454360',
            contrastText: '#EEEEFC', // Color used for text inside badge
        },

        background: {
            paper: '#222130', // Background color for all containers
            default: '#222130',
            application: '#1A1924',
            sidebar: '#4C4992',
            alternative: '#4C4992', // used on the dark theme to shwitch primary main to a darker shade
            elevation1: '#2B2A3C',
            elevation2: '#2B2A3C',
            // elevation2: '#302E42',
        },

        action: {
            // Colors used for Icons and Buttons -> this comes from MUI and we overwriting it with our colors
            active: actionColors[0.54],
            hover: actionColors[0.05],
            hoverOpacity: 0.05,
            selected: actionColors[0.08],
            selectedOpacity: 0.08,
            disabled: actionColors[0.32],
            disabledBackground: actionColors[0.12],
            disabledOpacity: 0.38,
            focus: actionColors[0.12],
            focusOpacity: 0.12,
            activatedOpacity: 0.12,
        },

        /**
         * General divider
         */
        divider: '#39384C',

        /**
         * Table colors.
         */
        table: {
            headerBackground: '#2B2A3C',
            headerHover: '#313045',
            divider: '#323144',
            rowHover: '#262536',
        },

        /**
         * Text highlight effect color. Used when filtering/searching over content
         */
        highlight: 'rgba(255, 234, 204, 0.7)',

        /**
         * Used for the interactive guide spotlight
         */
        spotlight: {
            border: '#8c89bf',
            outline: '#bcb9f3',
            pulse: '#bcb9f3',
        },

        /**
         * Background color used for the API command in the sidebar
         */
        codebox: 'rgba(52, 50, 94, 0.3)',

        /**
         * Links color
         */
        links: '#9792ED',

        /**
         * Gradient for the login page
         */
        loginGradient: {
            from: '#4C4992',
            to: '#4944a7',
        },

        /**
         * Colors for event log output
         */
        eventLog: {
            diffAdd: '#77AB2E',
            diffSub: '#df626c',
            edited: '#EEEEFC',
        },

        /**
         * For 'Seen' column on feature toggles list and other
         */
        seen: {
            unknown: '#2B2A3C',
            recent: '#4E6131',
            inactive: '#875D21',
            abandoned: '#8A3E45',
            primary: '#302E42',
        },

        /**
         * For Environment Accordion
         */
        envAccordion: {
            disabled: '#2B2A3C',
            expanded: '#1A1924',
        },

        /**
         * MUI grey colors
         */
        grey: {
            // This was to see were these colors are used from MUI
            // 50: '#A6000E',
            100: '#888799', // Disabled Switch base (OFF)
            // 200: '#A6000E',
            // 300: '#A6000E',
            // 400: '#A6000E',
            // 500: '#A6000E',
            600: '#343348', // slider tooltip background
            700: '#343348', // Dark tooltip background
            // 800: '#A6000E',
            // 900: '#A6000E',
            // A100: '#A6000E',
            // A200: '#A6000E',
            // A400: '#A6000E',
            // A700: '#A6000E',
        },
    },
};

export default createTheme({
    ...theme,
    components: {
        // Skeleton
        MuiCssBaseline: {
            styleOverrides: {
                '#react-joyride-portal ~ .MuiDialog-root': {
                    zIndex: 1399,
                },

                '.skeleton': {
                    '&::before': {
                        backgroundColor: theme.palette.background.elevation1,
                    },
                    '&::after': {
                        background:
                            'linear-gradient(90deg, rgba(223, 222, 255, 0) 0, rgba(223, 222, 255, 0.2) 100%, rgba(223, 222, 255, 0.5) 100%, rgba(223, 222, 255, 0))',
                    },
                },
                a: {
                    color: theme.palette.links,
                },
                '.dropdown-outline, .MuiAutocomplete-popper': {
                    // used for user dropdown, autocomplete, and change request primary button dropdown, notifications dropdown
                    outline: `1px solid ${theme.palette.divider}`,
                },
            },
        },

        // Links
        MuiLink: {
            styleOverrides: {
                root: ({ theme }) => ({
                    ...focusable(theme),
                    color: theme.palette.links,
                    '&:hover': {
                        textDecoration: 'none',
                    },
                }),
            },
        },

        // Breadcrumb
        MuiBreadcrumbs: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                    '& a': {
                        color: theme.palette.links,
                        textDecoration: 'none',
                        '&:hover': {
                            textDecoration: 'underline',
                        },
                    },
                }),
            },
        },

        // Tables
        MuiTableHead: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '& th': {
                        height: theme.shape.tableRowHeightCompact,
                        backgroundColor: theme.palette.table.headerBackground,
                        border: 0,
                        '&:first-of-type': {
                            borderTopLeftRadius: theme.shape.borderRadiusMedium,
                            borderBottomLeftRadius:
                                theme.shape.borderRadiusMedium,
                        },
                        '&:last-of-type': {
                            borderTopRightRadius:
                                theme.shape.borderRadiusMedium,
                            borderBottomRightRadius:
                                theme.shape.borderRadiusMedium,
                        },
                    },
                }),
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '&.MuiTableRow-root:hover': {
                        //Not all the tables have row hover background. This will add background color on row hover for all the tables
                        background: theme.palette.table.rowHover, //overwrite action.hover
                    },
                }),
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderBottomColor: theme.palette.table.divider,
                }),
            },
        },

        // Alerts
        MuiAlert: {
            styleOverrides: {
                root: ({ theme }) => ({
                    padding: theme.spacing(2, 3),
                    borderRadius: theme.shape.borderRadiusMedium,
                    a: {
                        color: 'inherit',
                    },
                    '> .MuiAlert-icon': {
                        padding: 0,
                        opacity: 1,
                        fontSize: '24px',
                    },
                    '> .MuiAlert-message': {
                        padding: '3px 0 0 0',
                    },
                    '&.MuiAlert-standardInfo': {
                        backgroundColor: theme.palette.info.light,
                        color: theme.palette.info.contrastText,
                        border: `1px solid ${theme.palette.info.border}`,
                        '& .MuiAlert-icon': {
                            color: theme.palette.info.main,
                        },
                    },
                    '&.MuiAlert-standardSuccess': {
                        backgroundColor: theme.palette.success.light,
                        color: theme.palette.success.contrastText,
                        border: `1px solid ${theme.palette.success.border}`,
                        '& .MuiAlert-icon': {
                            color: theme.palette.success.main,
                        },
                    },
                    '&.MuiAlert-standardWarning': {
                        backgroundColor: theme.palette.warning.light,
                        color: theme.palette.warning.contrastText,
                        border: `1px solid ${theme.palette.warning.border}`,
                        '& .MuiAlert-icon': {
                            color: theme.palette.warning.main,
                        },
                    },
                    '&.MuiAlert-standardError': {
                        backgroundColor: theme.palette.error.light,
                        color: theme.palette.error.contrastText,
                        border: `1px solid ${theme.palette.error.border}`,
                        '& .MuiAlert-icon': {
                            color: theme.palette.error.main,
                        },
                    },
                }),
            },
        },

        // Horizontal menu tabs
        MuiTabs: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '& .MuiTabs-indicator': {
                        backgroundColor: theme.palette.background.alternative,
                        height: '4px',
                    },
                    '& .MuiTabs-flexContainer': {
                        minHeight: '70px',
                        maxHeight: '70px',
                    },
                }),
            },
        },
        MuiTab: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.text.primary,
                    fontSize: '1rem',
                    textTransform: 'none',
                    fontWeight: 400,
                    lineHeight: '1',
                    minHeight: '62px',
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    },
                    '&.Mui-selected': {
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                    },
                    '& > span': {
                        color: theme.palette.primary.main, //Based on this color is created the focus color/effect
                    },
                    [theme.breakpoints.down('md')]: {
                        padding: '12px 0px',
                    },
                }),
            },
        },

        // Environment accordion
        MuiAccordion: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '&:first-of-type, &:last-of-type': {
                        borderRadius: theme.shape.borderRadiusLarge,
                    },
                    '&.environment-accordion.Mui-expanded': {
                        outline: `2px solid ${alpha(
                            theme.palette.background.alternative,
                            0.6
                        )}`,
                        boxShadow: `0px 2px 8px ${alpha(
                            theme.palette.primary.main,
                            0.2
                        )}`,
                    },
                    '&.accordion-disabled': {
                        outline: `1px solid ${alpha('#39384C', 0.5)}`,
                        backgroundColor: theme.palette.background.application,
                    },
                    '&.accordion-disabled.Mui-expanded .MuiAccordionSummary-root':
                        {
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        },
                }),
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    '& > .MuiAccordionSummary-content.Mui-expanded': {
                        margin: '12px 0',
                    },
                    '&.Mui-expanded': {
                        minHeight: '0',
                    },
                },
            },
        },

        // Project overview, improve switch (ON - state) hover effect color
        MuiSwitch: {
            styleOverrides: {
                root: ({ theme }) => ({
                    zIndex: 1,
                    '&&& > .Mui-checked:hover': {
                        backgroundColor: actionColors[0.08],
                    },
                    '&&& > .Mui-checked.Mui-disabled': {
                        color: '#423F6E',
                    },
                }),
            },
        },

        // Overwiteing the action.disabledOpacity from MUI
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    '&.Mui-disabled': {
                        opacity: 0.4,
                    },
                },
            },
        },

        // Inputs background - This is used when we have inputs on a darker background (e.g. edit contstraints, playground)
        MuiInputBase: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.background.paper,
                }),
            },
        },

        // Top menu text color
        MuiAppBar: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.text.primary,
                }),
            },
        },

        // For dark theme, primary buttons are a bit darker then the primary.main that we use as a primary color
        MuiButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '&:not(.Mui-disabled).MuiButton-containedPrimary': {
                        backgroundColor: theme.palette.background.alternative,
                        '&:hover': {
                            backgroundColor: theme.palette.secondary.light,
                        },
                    },
                }),
            },
        },

        // Constraints negation icon
        MuiIconButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '&.operator-is-active svg': {
                        fill: theme.palette.background.application,
                    },
                }),
            },
        },

        // Inputs
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }) => ({
                    fieldset: {
                        borderColor: '#646382',
                    },

                    '&&&:hover fieldset': {
                        borderColor: '#8B8BA7',
                    },

                    '&&&.Mui-focused fieldset': {
                        borderColor: '#9792ED',
                    },

                    '&&&.Mui-disabled fieldset': {
                        borderColor: '#47475D',
                    },
                }),
            },
        },

        // Popovers
        MuiPopover: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '.MuiPopover-paper': {
                        outline: `1px solid ${theme.palette.divider}`,
                    },
                }),
            },
        },
    },
});
