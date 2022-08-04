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
        h3: {
            fontSize: '1rem',
            fontWeight: '700',
        },
        caption: {
            fontSize: `${12 / 16}rem`,
        },
    },
    fontSizes: {
        mainHeader: '1.25rem',
        subHeader: '1.1rem',
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
        borderRadius: '4px',
        borderRadiusMedium: '8px',
        borderRadiusLarge: '12px',
        borderRadiusExtraLarge: '20px',
        tableRowHeight: 64,
        tableRowHeightCompact: 56,
        tableRowHeightDense: 48,
    },
    palette: {
        primary: {
            main: colors.purple[800],
            light: colors.purple[700],
            dark: colors.purple[900],
        },
        secondary: {
            light: colors.purple[50],
            main: colors.purple[800],
            dark: colors.purple[900],
            border: colors.purple[300],
        },
        info: {
            light: colors.blue[50],
            main: colors.blue[500],
            dark: colors.blue[700],
            border: colors.blue[200],
        },
        success: {
            light: colors.green[50],
            main: colors.green[600],
            dark: colors.green[800],
            border: colors.green[300],
        },
        warning: {
            light: colors.orange[100],
            main: colors.orange[800],
            dark: colors.orange[900],
            border: colors.orange[500],
        },
        error: {
            light: colors.red[50],
            main: colors.red[700],
            dark: colors.red[800],
            border: colors.red[300],
        },
        neutral: {
            light: colors.grey[100],
            main: colors.grey[700],
            dark: colors.grey[800],
            border: colors.grey[500],
        },
        tertiary: {
            light: colors.grey[200],
            main: colors.grey[400],
            dark: colors.grey[600],
            background: 'white',
            contrast: colors.grey[300],
        },
        divider: colors.grey[300],
        dividerAlternative: colors.grey[400],
        tableHeaderHover: colors.grey[400],
        highlight: '#FFEACC',
        secondaryContainer: colors.grey[200],
        sidebarContainer: 'rgba(32,32,33, 0.2)',
        grey: colors.grey,
        lightBorder: colors.grey[400],
        text: {
            primary: colors.grey[900],
            secondary: colors.grey[800],
            disabled: colors.grey[600],
            tertiaryContrast: '#fff',
        },
        code: {
            main: '#0b8c8f',
            diffAdd: 'green',
            diffSub: 'red',
            diffNeutral: 'black',
            edited: 'blue',
            background: '#efefef',
        },
        activityIndicators: {
            unknown: colors.grey[100],
            recent: colors.green[100],
            inactive: colors.orange[200],
            abandoned: colors.red[200],
            primary: colors.purple[100],
        },
        inactiveIcon: colors.grey[600],
    },
    components: {
        MuiLink: {
            styleOverrides: {
                root: {
                    color: colors.purple[900],
                    '&:hover': {
                        textDecoration: 'none',
                    },
                },
            },
        },
        MuiBreadcrumbs: {
            styleOverrides: {
                root: {
                    color: colors.grey[900],
                    fontSize: '0.875rem',
                    '& a': {
                        color: colors.purple[900],
                        textDecoration: 'underline',
                        '&:hover': {
                            textDecoration: 'none',
                        },
                    },
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    background: 'transparent',
                    '& th': {
                        background: colors.grey[200],
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&.MuiTableRow-hover:hover': {
                        background: colors.grey[100],
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottomColor: colors.grey[300],
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    a: {
                        color: 'inherit',
                    },
                    '&.MuiAlert-standardInfo': {
                        backgroundColor: colors.blue[50],
                        color: colors.blue[700],
                        border: `1px solid ${colors.blue[200]}`,
                        '& .MuiAlert-icon': {
                            color: colors.blue[500],
                        },
                    },
                    '&.MuiAlert-standardSuccess': {
                        backgroundColor: colors.green[50],
                        color: colors.green[800],
                        border: `1px solid ${colors.green[300]}`,
                        '& .MuiAlert-icon': {
                            color: colors.green[500],
                        },
                    },
                    '&.MuiAlert-standardWarning': {
                        backgroundColor: colors.orange[100],
                        color: colors.orange[900],
                        border: `1px solid ${colors.orange[500]}`,
                        '& .MuiAlert-icon': {
                            color: colors.orange[800],
                        },
                    },
                    '&.MuiAlert-standardError': {
                        backgroundColor: colors.red[50],
                        color: colors.red[800],
                        border: `1px solid ${colors.red[300]}`,
                        '& .MuiAlert-icon': {
                            color: colors.red[700],
                        },
                    },
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    '& .MuiTabs-indicator': {
                        height: '4px',
                    },
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    color: colors.grey[900],
                    fontSize: '1rem',
                    textTransform: 'none',
                    fontWeight: 400,
                    minHeight: '62px',
                    '&:hover': {
                        backgroundColor: colors.grey[200],
                    },
                    '&.Mui-selected': {
                        color: colors.grey[900],
                        fontWeight: 700,
                    },
                    '& > span': {
                        color: colors.purple[900],
                    },
                },
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    '& > .MuiAccordionSummary-content.Mui-expanded': {
                        margin: '12px 0',
                    },
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    zIndex: 1,
                    '&:not(.Mui-checked) .MuiTouchRipple-child': {
                        color: colors.grey['500'],
                    },
                },
            },
        },
        MuiIcon: {
            styleOverrides: {
                colorDisabled: {
                    color: colors.grey[600],
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    '&.Mui-disabled': {
                        opacity: 0.66,
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: ({ ownerState, theme }) => ({
                    ...(ownerState.variant === 'outlined' &&
                        ownerState.size === 'small' && {
                            borderRadius: theme.shape.borderRadius,
                            margin: 0,
                            borderWidth: 1,
                            borderStyle: 'solid',
                            fontWeight: theme.typography.fontWeightBold,
                            fontSize: theme.typography.caption.fontSize,
                            ...(ownerState.color === 'success' && {
                                backgroundColor: colors.green[50],
                                borderColor: theme.palette.success.border,
                                color: theme.palette.success.dark,
                            }),
                            ...(ownerState.color === 'default' && {
                                color: theme.palette.text.secondary,
                            }),
                            ...(ownerState.color === 'error' && {
                                color: theme.palette.error.dark,
                                background: theme.palette.error.light,
                                borderColor: theme.palette.error.border,
                            }),
                        }),
                }),
            },
        },
    },
});
