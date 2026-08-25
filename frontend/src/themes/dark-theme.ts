import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';
import { focusable } from 'themes/themeStyles';
import { colors } from './colors.js';
import {
    buttonSizes,
    controlOverrides,
    iconButtonRoot,
    iconButtonSizes,
    outlinedInputSizing,
    subtleOutlinedButton,
} from './controls.js';
import { baseTheme } from './theme.js';

// Redefining `MuiOutlinedInput` (at the time of writing this for border colors) fully replaces the shared
// one from `controlOverrides`, dropping its input sizing. This bakes the sizing
// back in so a border override can't lose it.
const withInputSizing =
    (theme: object) =>
    ({ ownerState }: { ownerState?: { size?: string } }) => ({
        ...outlinedInputSizing(ownerState),
        ...theme,
    });

const actionColors = {
    0.54: 'rgba(223, 222, 255, 0.54)',
    0.32: 'rgba(223, 222, 255, 0.32)',
    0.12: 'rgba(223, 222, 255, 0.12)',
    0.08: 'rgba(223, 222, 255, 0.08)',
    0.05: 'rgba(223, 222, 255, 0.05)',
};

const theme = {
    ...baseTheme,
    mode: 'dark',
    boxShadows: {
        main: '0px 2px 4px rgba(129, 122, 254, 0.2)',
        card: '0px 2px 10px rgba(28, 25, 78, 0.12)',
        elevated: '0px 1px 20px rgba(45, 42, 89, 0.1)',
        popup: '0px 2px 6px rgba(0, 0, 0, 0.6)',
        primaryHeader: '0px 8px 24px rgba(97, 91, 194, 0.2)',
        separator: '0px 2px 4px rgba(32, 32, 33, 0.12)', // Notifications header
        accordionFooter: 'inset 0px 2px 4px rgba(32, 32, 33, 0.05)',
        reverseFooter: 'inset 0px -2px 4px rgba(32, 32, 33, 0.05)',
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
            contrastText: '#EEEEFC',
            // Tinted "container" recipe (subtle purple surface: badges, chips, soft banners).
            // Absorbed from the former `secondary` palette.
            container: '#34325E',
            containerBorder: '#4C4992',
            onContainer: '#EEEEFC',
        },
        // Dormant: all usages migrated to `primary` (main + container recipe).
        // Kept defined so MUI's default (pink) secondary never leaks; free to repurpose
        // for a genuinely new secondary color later.
        secondary: {
            main: '#9792ED',
            light: '#34325E',
            dark: '#EEEEFC',
            border: '#4C4992',
            contrastText: '#EEEEFC',
        },
        info: {
            // main: '#5483C9',  // used on icons on these elements
            main: '#a2bbe2',
            light: '#b8cbe9',
            dark: '#a2bbe2', // used for text on these elements
            contrastText: '#202021',
            container: '#1A2641',
            containerBorder: '#1B407A',
            onContainer: '#EEEEFC',
        },
        success: {
            // main: '#62872F',  // used on icons on these elements
            main: '#94ae6f',
            light: '#a8bd88',
            dark: '#94ae6f', // used for text on these elements
            contrastText: '#202021',
            container: '#333D30',
            containerBorder: '#3D600C',
            onContainer: '#EEEEFC',
        },
        warning: {
            // main: '#9E691C',  // used on icons on these elements
            main: '#bc7d21',
            light: '#d0913a',
            dark: '#bc7d21', // used for text on these elements
            contrastText: '#202021',
            container: '#3B302C',
            containerBorder: '#6C4A19',
            onContainer: '#EEEEFC',
        },
        error: {
            // main: '#B93F4A',  // used on error buttons // used on icons on these elements
            main: '#ff6472',
            light: '#ff8591',
            // dark: '#F15260',  // used for text on these elements
            dark: '#ff6472', // used for text on these elements
            contrastText: '#202021',
            container: '#3F2835',
            containerBorder: '#8A3E45',
            onContainer: '#EEEEFC',
        },
        web: {
            main: '#1A4049', // used on sales-related elements
            contrastText: '#EEEEFC',
        },

        /**
         *  Used for grey badges, hover elements, and grey light elements
         */
        neutral: {
            main: '#858699',
            light: '#9a9bab',
            dark: '#EEEEFC', // used for text on these elements
            contrastText: '#202021',
            container: '#2B2A3C',
            containerBorder: '#454360',
            onContainer: '#EEEEFC',
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
            alternative: colors.purple[1000],
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
         * For 'Seen' column on feature flags list and other
         */
        seen: {
            unknown: '#2B2A3C',
            recent: '#4E6131',
            inactive: '#875D21',
            abandoned: '#8A3E45',
            primary: '#302E42',
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
        variants: colors.darkVariants,

        /**
         * Dashboard and charts
         */
        charts: {
            A1: '#6C65E5',
            A2: '#9D98EE',
            A3: '#CECCF6',
            A4: '#F1F0FC',
            B1: '#1791AE',
            C1: '#DF416E',
            D1: '#D76500',
            E1: '#68A611',
            series: colors.chartSeries,
            flagMetrics: {
                enabled: '#A39EFF',
                notEnabled: '#D8D6FF',
            },
        },

        inverse: {
            main: '#EEEEFC',
            contrastText: colors.grey[900],
        },

        /**
         * Syntax highlighting colors for code examples (e.g. SDK onboarding snippets).
         */
        codeHighlighting: {
            keyword: '#ff6472',
            selectorTag: '#ff6472',
            string: '#a2bbe2',
            number: '#9792ED',
            literal: '#9792ED',
            comment: '#A0A0B1',
            builtIn: '#bc7d21',
            title: '#9792ED',
            class_: '#85c17e',
            type: '#a2bbe2',
            attr: '#c98940',
            variable: '#EEEEFC',
            tag: '#94ae6f',
            meta: '#A0A0B1',
        },
    },
} as const;

export const darkTheme = createTheme({
    ...theme,
    components: {
        // Shared control sizing + ripple removal (design system v2)
        ...controlOverrides,

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
                    fontWeight: theme.typography.fontWeightMedium,
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
                    fontWeight: theme.typography.fontWeightMedium,
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
                    '&.MuiAlert-standard.MuiAlert-colorInfo': {
                        backgroundColor: theme.palette.info.container,
                        color: theme.palette.info.onContainer,
                        border: `1px solid ${theme.palette.info.containerBorder}`,
                        '& .MuiAlert-icon': {
                            color: theme.palette.info.main,
                        },
                    },
                    '&.MuiAlert-standard.MuiAlert-colorSuccess': {
                        backgroundColor: theme.palette.success.container,
                        color: theme.palette.success.onContainer,
                        border: `1px solid ${theme.palette.success.containerBorder}`,
                        '& .MuiAlert-icon': {
                            color: theme.palette.success.main,
                        },
                    },
                    '&.MuiAlert-standard.MuiAlert-colorWarning': {
                        backgroundColor: theme.palette.warning.container,
                        color: theme.palette.warning.onContainer,
                        border: `1px solid ${theme.palette.warning.containerBorder}`,
                        '& .MuiAlert-icon': {
                            color: theme.palette.warning.main,
                        },
                    },
                    '&.MuiAlert-standard.MuiAlert-colorError': {
                        backgroundColor: theme.palette.error.container,
                        color: theme.palette.error.onContainer,
                        border: `1px solid ${theme.palette.error.containerBorder}`,
                        '& .MuiAlert-icon': {
                            color: theme.palette.error.main,
                        },
                    },
                }),
            },
        },

        // Horizontal menu tabs
        MuiTabs: {
            defaultProps: {
                'data-public': true,
            } as any,
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
                    fontSize: theme.typography.body2.fontSize,
                    textTransform: 'none',
                    fontWeight: theme.typography.fontWeightMedium,
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
                            0.6,
                        )}`,
                        boxShadow: `0px 2px 8px ${alpha(
                            theme.palette.primary.main,
                            0.2,
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

        // For dark theme, primary buttons are a bit darker than the primary.main that we use as a primary color
        MuiButton: {
            defaultProps: {
                // unsized buttons render ~36px today — `large` on the new
                // scale preserves their visual weight
                size: 'large',
                disableElevation: true, // no shadow on contained buttons
            },
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: theme.shape.borderRadius,
                    textTransform: 'none',
                    fontWeight: 600, // semi-bold
                    ...subtleOutlinedButton(theme),
                    '&:not(.Mui-disabled).MuiButton-contained.MuiButton-colorPrimary':
                        {
                            backgroundColor:
                                theme.palette.background.alternative,
                            '&:hover': {
                                backgroundColor: theme.palette.secondary.light,
                            },
                        },
                }),
                ...buttonSizes,
            },
        },

        // Constraints negation icon
        MuiIconButton: {
            defaultProps: {
                // unsized icon buttons keep their pre-v2 weight (~36px) for now
                size: 'large',
            },
            styleOverrides: {
                root: ({ theme }) => ({
                    ...iconButtonRoot(theme),
                    '&.operator-is-active svg': {
                        fill: theme.palette.background.application,
                    },
                }),
                ...iconButtonSizes,
            },
        },

        // Inputs
        MuiOutlinedInput: {
            styleOverrides: {
                root: withInputSizing({
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

        MuiIcon: {
            defaultProps: {
                baseClassName: 'material-symbols-outlined',
            },
        },
    },
});
