import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

const themeColors = {
    main: colors.darkblue[900],
    secondary: colors.darkblue[800],
    textColor: '#ffffffe6',
    hover: 'rgb(255, 255, 255, 0.7)',
};

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
        primary: {
            main: themeColors.textColor,
            light: colors.purple[700],
            dark: colors.purple[900],
        },
        secondary: {
            main: colors.purple[800],
            light: colors.purple[700],
            dark: colors.purple[900],
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
            dark: themeColors.main,
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
        background: {
            paper: themeColors.main,
        },
        divider: themeColors.secondary,
        dividerAlternative: colors.grey[400],
        tableHeaderHover: colors.darkblue[700],
        tableHeaderBackground: themeColors.secondary,
        tableHeaderColor: themeColors.textColor,
        highlight: '#FFEACC',
        secondaryContainer: themeColors.secondary,
        contentWrapper: colors.darkblue[800],
        formBackground: themeColors.main,
        formSidebar: colors.darkblue[1000],
        headerBackground: themeColors.main,
        footerBackground: themeColors.main,
        sidebarContainer: 'rgba(32,32,33, 0.2)',
        codebox: colors.darkblue[600],
        featureMetaData: colors.darkblue[1000],
        playgroundBackground: colors.darkblue[600],
        playgroundFormBackground: themeColors.secondary,
        standaloneBackground: colors.black,
        featureStrategySegmentChipBackground: themeColors.secondary,
        featureSegmentSearchBackground: themeColors.secondary,
        dialogHeaderBackground: themeColors.secondary,
        dialogHeaderText: themeColors.textColor,
        lightBorder: colors.darkblue[500],
        constraintAccordion: {
            editBackground: colors.darkblue[600],
            background: themeColors.secondary,
            operatorBackground: themeColors.main,
        },
        standaloneBannerGradient: {
            from: colors.darkblue[1000],
            to: colors.black,
        },
        projectCard: {
            hover: themeColors.secondary,
            textColor: themeColors.textColor,
        },
        formSidebarTextColor: themeColors.textColor,
        checkmarkBadge: themeColors.secondary,
        inputLabelBackground: 'transparent',
        grey: colors.grey,
        text: {
            primary: themeColors.textColor,
            secondary: colors.grey[800],
            disabled: colors.grey[600],
        },
        code: {
            main: '#0b8c8f',
            diffAdd: 'green',
            diffSub: 'red',
            diffNeutral: 'black',
            edited: 'blue',
        },
        neutral: {
            light: colors.darkblue[500],
            main: colors.grey[700],
            dark: colors.grey[800],
            border: colors.grey[500],
        },
        activityIndicators: {
            primary: themeColors.secondary,
            unknown: themeColors.secondary,
            recent: themeColors.secondary,
            inactive: themeColors.secondary,
            abandoned: themeColors.secondary,
        },
        tertiary: {
            light: themeColors.secondary,
            main: colors.grey[400],
            dark: colors.grey[600],
            background: 'white',
            contrast: colors.grey[300],
        },
        inactiveIcon: colors.grey[600],
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    color: themeColors.textColor,
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: themeColors.textColor,
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: colors.white,
                    '&:hover': {
                        backgroundColor: themeColors.hover,
                    },
                    '&.Mui-disabled': {
                        '& .MuiSvgIcon-root': {
                            color: colors.grey[700],
                        },
                    },
                },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    color: colors.white,
                    '&:hover': {
                        textDecoration: 'none',
                    },
                },
            },
        },
        MuiBreadcrumbs: {
            styleOverrides: {
                root: {
                    color: themeColors.textColor,
                    fontSize: '0.875rem',
                    '& a': {
                        color: themeColors.textColor,
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
                        background: themeColors.secondary,
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottomColor: themeColors.main,
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
                        '& .MuiAlert-icon .MuiSvgIcon-root': {
                            color: colors.blue[500],
                        },
                    },
                    '&.MuiAlert-standardSuccess': {
                        backgroundColor: colors.green[50],
                        color: colors.green[800],
                        border: `1px solid ${colors.green[300]}`,
                        '& .MuiAlert-icon .MuiSvgIcon-root': {
                            color: colors.green[500],
                        },
                    },
                    '&.MuiAlert-standardWarning': {
                        backgroundColor: colors.orange[100],
                        color: colors.orange[900],
                        border: `1px solid ${colors.orange[500]}`,
                        '& .MuiAlert-icon .MuiSvgIcon-root': {
                            color: colors.orange[800],
                        },
                    },
                    '&.MuiAlert-standardError': {
                        backgroundColor: colors.red[50],
                        color: colors.red[800],
                        border: `1px solid ${colors.red[300]}`,
                        '& .MuiAlert-icon .MuiSvgIcon-root': {
                            color: colors.red[700],
                        },
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    '&.Mui-disabled': {
                        backgroundColor: colors.grey[400],
                    },
                },
            },
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: themeColors.textColor,
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    backgroundColor: themeColors.main,
                    color: themeColors.textColor,
                    '& .MuiTabs-indicator': {
                        height: '4px',
                    },
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    color: themeColors.textColor,
                    fontSize: '1rem',
                    textTransform: 'none',
                    fontWeight: 400,
                    minHeight: '62px',
                    '&:hover': {
                        backgroundColor: themeColors.secondary,
                    },
                    '&.Mui-selected': {
                        color: themeColors.textColor,
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
                root: {
                    color: colors.white,
                },
                colorDisabled: {
                    color: colors.white[600],
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                root: {
                    '.MuiMenu-list': {
                        backgroundColor: colors.darkblue[600],
                    },
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    '&.Mui-disabled': {
                        opacity: 0.66,
                    },
                    '&:hover': {
                        backgroundColor: themeColors.secondary,
                    },
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.darkblue[1000],
                    '.MuiSvgIcon-root': {
                        color: '#fff',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: themeColors.main,
                    color: themeColors.textColor,
                },
            },
        },
    },
});
