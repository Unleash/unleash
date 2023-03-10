import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

export default createTheme({
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
        separator: '0px 2px 3px hsl(0deg 0% 78% / 50%)',
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

    palette: {
        common: {
            // Used for text color
            white: colors.grey[50],
        },
        text: {
            primary: colors.grey[900],
            secondary: colors.grey[800],
            disabled: colors.grey[600],
        },
        primary: {
            main: colors.purple[800],
            light: colors.purple[700],
            dark: colors.purple[900],
            contrastText: colors.grey[50], // Color used for content when primary.main is used as a background
        },
        secondary: {
            // Used for purple badges and puple light elements
            light: colors.purple[50],
            main: colors.purple[800],
            dark: colors.purple[900],
            border: colors.purple[300],
        },
        info: {
            light: colors.blue[50],
            main: colors.blue[500],
            dark: colors.blue[700],
            contrastText: colors.grey[50], // Color used for content when info.main is used as a background
            border: colors.blue[200],
        },
        success: {
            light: colors.green[50],
            main: colors.green[600],
            dark: colors.green[800],
            contrastText: colors.grey[50], // Color used for content when success.main is used as a background
            border: colors.green[300],
        },
        warning: {
            light: colors.orange[100],
            main: colors.orange[800],
            dark: colors.orange[900],
            contrastText: colors.grey[50], // Color used for content when warning.main is used as a background
            border: colors.orange[500],
        },
        error: {
            light: colors.red[50],
            main: colors.red[700],
            dark: colors.red[800],
            contrastText: colors.grey[50], // Color used for content when error.main is used as a background
            border: colors.red[300],
        },

        /**
         *  Used for grey badges, hover elements, and grey light elements
         */
        neutral: {
            light: colors.grey[100],
            main: colors.grey[700],
            dark: colors.grey[800],
            border: colors.grey[400],
        },

        background: {
            paper: colors.grey[50],
            default: colors.grey[50],
            application: colors.grey[300],
            sidebar: colors.purple[800],
            elevation1: colors.grey[100],
            elevation2: colors.grey[200],
        },

        action: {
            // Colors used for Icons and Buttons -> this comes from MUI and we overwriting it with our colors
            active: colors.action[0.54],
            hover: colors.action[0.05],
            hoverOpacity: 0.05,
            selected: colors.action[0.08],
            selectedOpacity: 0.08,
            disabled: colors.action[0.32],
            disabledBackground: colors.action[0.12],
            disabledOpacity: 0.38,
            focus: colors.action[0.12],
            focusOpacity: 0.12,
            activatedOpacity: 0.12,
        },

        /**
         * General divider
         */
        divider: colors.grey[400],

        /**
         * Table colors.
         */
        table: {
            headerColor: colors.grey[900], //New - Is needed? ###CHECK
            headerBackground: colors.grey[200],
            headerHover: colors.grey[300],
            divider: colors.grey[300],
            rowHover: colors.grey[100],
        },

        /**
         * Text highlight effect color. Used when filtering/searching over content.
         */
        highlight: colors.orange[200],

        /**
         * Background color used for the API command in the sidebar
         */
        codebox: colors.action[0.12],

        /**
         * Gradient for the login page
         */
        loginGradient: {
            from: colors.purple[800],
            to: colors.purple[950],
        },

        /**
         * Colors for event log output.
         */
        eventLog: {
            diffAdd: colors.green[800],
            diffSub: colors.red[800],
            edited: colors.grey[900],
        },

        /**
         * For 'Seen' column on feature toggles list and other.
         */
        seen: {
            unknown: colors.grey[100],
            recent: colors.green[100],
            inactive: colors.orange[200],
            abandoned: colors.red[200],
            primary: colors.purple[100],
        },
    },

    components: {
        // Links
        MuiLink: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.primary.dark,
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
                        color: theme.palette.primary.dark,
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
                    // background: 'transparent',
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
                    borderRadius: theme.shape.borderRadiusMedium,
                    a: {
                        color: 'inherit',
                    },
                    '&.MuiAlert-standardInfo': {
                        backgroundColor: theme.palette.info.light,
                        color: theme.palette.info.dark,
                        border: `1px solid ${theme.palette.info.border}`,
                        '& .MuiAlert-icon': {
                            color: theme.palette.info.main,
                        },
                    },
                    '&.MuiAlert-standardSuccess': {
                        backgroundColor: theme.palette.success.light,
                        color: theme.palette.success.dark,
                        border: `1px solid ${theme.palette.success.border}`,
                        '& .MuiAlert-icon': {
                            color: theme.palette.success.main,
                        },
                    },
                    '&.MuiAlert-standardWarning': {
                        backgroundColor: theme.palette.warning.light,
                        color: theme.palette.warning.dark,
                        border: `1px solid ${theme.palette.warning.border}`,
                        '& .MuiAlert-icon': {
                            color: theme.palette.warning.main,
                        },
                    },
                    '&.MuiAlert-standardError': {
                        backgroundColor: theme.palette.error.light,
                        color: theme.palette.error.dark,
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
                        backgroundColor: theme.palette.background.elevation2,
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

        // Constraint accordion / cards
        MuiAccordion: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '&:first-of-type, &:last-of-type': {
                        borderRadius: theme.shape.borderRadiusMedium,
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

        // Project overview, improve toggle/switch disabled focus effect color
        MuiSwitch: {
            styleOverrides: {
                root: ({ theme }) => ({
                    zIndex: 1,
                    '&:not(.Mui-checked) .MuiTouchRipple-child': {
                        color: theme.palette.neutral.border,
                    },
                }),
            },
        },

        // Overwiteing the action.disabledOpacity from MU
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    '&.Mui-disabled': {
                        opacity: 0.66,
                    },
                },
            },
        },

        // Inputs background - This is used when we have inputs on a grey background (e.g. edit contstraints, playground)
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
    },
});
