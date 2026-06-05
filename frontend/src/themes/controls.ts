import type { Components, Theme } from '@mui/material/styles';

/**
 * Design system v2 — shared sizing and behavior for controls
 * (buttons, icon buttons, inputs, selects).
 *
 * Buttons, inputs and selects share one height scale so they line up
 * when placed next to each other. Two candidate scales are defined;
 * flip `controlHeights` between them to compare live in the app.
 */
const scales = {
    compact: { small: 24, medium: 28, large: 32 },
    comfortable: { small: 24, medium: 30, large: 36 },
} as const;

export const controlHeights = scales.comfortable;

type ControlSize = keyof typeof scales.compact;

const controlFontSizes: Record<ControlSize, string> = {
    small: `${12 / 16}rem`,
    medium: `${13 / 16}rem`,
    large: `${14 / 16}rem`,
};

const controlPaddingX: Record<ControlSize, number> = {
    small: 8,
    medium: 10,
    large: 12,
};

const controlIconSizes: Record<ControlSize, string> = {
    small: '16px',
    medium: '18px',
    large: '20px',
};

const sizeOf = (size: unknown): ControlSize =>
    size === 'small' || size === 'large' ? size : 'medium';

/**
 * Button size definitions. Spread into `MuiButton.styleOverrides`
 * (next to `root`) in both themes.
 *
 * Note: today's unsized buttons render ~36px (MUI medium), so the theme
 * sets `defaultProps.size = 'large'` to preserve their visual weight on
 * the new scale. Buttons explicitly marked `small` today map to `medium`.
 */
const buttonPaddingX: Record<ControlSize, number> = {
    small: controlPaddingX.small + 2, // 10px
    medium: controlPaddingX.medium + 2, // 12px
    large: controlPaddingX.large, // 12px
};

// Gap between a button's icon and its label, per size.
const buttonIconGap: Record<ControlSize, number> = {
    small: 3,
    medium: 4,
    large: 5,
};

// How far the icon pulls toward the button edge (reduces the padding on the
// icon side so icon buttons don't look left-heavy).
const buttonIconPull: Record<ControlSize, number> = {
    small: -4,
    medium: -5,
    large: -7,
};

const buttonSize = (size: ControlSize) => ({
    height: controlHeights[size],
    minHeight: controlHeights[size],
    padding: `0 ${buttonPaddingX[size]}px`,
    fontSize: controlFontSizes[size],
    // Scale the icon and tighten its spacing to the button height. MUI's
    // defaults are tuned for its own (taller) sizes and look oversized here.
    '& .MuiButton-startIcon > *:first-of-type, & .MuiButton-endIcon > *:first-of-type':
        {
            fontSize: controlIconSizes[size],
        },
    '& .MuiButton-startIcon': {
        marginLeft: buttonIconPull[size],
        marginRight: buttonIconGap[size],
    },
    '& .MuiButton-endIcon': {
        marginRight: buttonIconPull[size],
        marginLeft: buttonIconGap[size],
    },
});

export const buttonSizes = {
    sizeSmall: buttonSize('small'),
    sizeMedium: buttonSize('medium'),
    sizeLarge: buttonSize('large'),
} as const;

/**
 * Icon button size definitions, matched to the control scale so icon
 * buttons align with adjacent buttons and inputs. Spread into
 * `MuiIconButton.styleOverrides` in both themes.
 */
export const iconButtonSizes = {
    sizeSmall: {
        height: controlHeights.small,
        width: controlHeights.small,
        padding: 0,
        '& svg': { fontSize: controlIconSizes.small },
    },
    sizeMedium: {
        height: controlHeights.medium,
        width: controlHeights.medium,
        padding: 0,
        '& svg': { fontSize: controlIconSizes.medium },
    },
    sizeLarge: {
        height: controlHeights.large,
        width: controlHeights.large,
        padding: 0,
        '& svg': { fontSize: controlIconSizes.large },
    },
} as const;

/**
 * Secondary (outlined) buttons: divider-colored border with primary-colored
 * text (matching the text button), so they read as a quiet secondary action
 * and sit well next to a contained primary. Spread into the
 * `MuiButton.styleOverrides.root` object in both themes.
 */
export const subtleOutlinedButton = (theme: Theme) => ({
    '&.MuiButton-outlined.MuiButton-colorPrimary': {
        color: theme.palette.primary.main,
        borderColor: theme.palette.divider,
        '&:hover': {
            // border picks up the primary purple; background uses the light
            // purple token (secondary.light = purple[50] in light mode)
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.secondary.light,
        },
    },
});

/**
 * Input/select sizing on the shared control scale. Used by the
 * `MuiOutlinedInput` override below; the dark theme merges it into its
 * own `MuiOutlinedInput` override (which also sets border colors).
 */
export const outlinedInputSizing = (ownerState?: { size?: unknown }) => {
    const size = sizeOf(ownerState?.size);
    const height = controlHeights[size];
    const paddingX = controlPaddingX[size];
    return {
        fontSize: controlFontSizes[size],
        // Fixed control heights. Multiline fields and chip-filled
        // Autocomplete roots grow, bounded by minHeight instead.
        '&:not(.MuiInputBase-multiline):not(.MuiAutocomplete-inputRoot)': {
            height,
        },
        '&.MuiAutocomplete-inputRoot': {
            minHeight: height,
            paddingTop: 0,
            paddingBottom: 0,
            // center the value/tags vertically; without this the zeroed
            // padding leaves the content stuck to the top of the field
            alignItems: 'center',
        },
        '&:not(.MuiInputBase-multiline) .MuiOutlinedInput-input': {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: paddingX,
        },
        // Multiline fields: match the single-line horizontal padding (MUI's
        // stock multiline padding is different and looks inconsistent), and
        // read as a distinct box at least two lines tall. The min-height acts
        // as a floor; fields with explicit rows/minRows still grow beyond it.
        '&.MuiInputBase-multiline': {
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: paddingX,
            paddingRight: paddingX,
        },
        // Floor only: short multiline fields read as a ~2-line box. Fields
        // with explicit minRows/rows are already taller, so this is a no-op for
        // them. CRITICAL: exclude the aria-hidden shadow textarea MUI uses to
        // measure row height — styling it inflates the measured row height and
        // multiplies the height of minRows fields.
        '&.MuiInputBase-multiline .MuiInputBase-input:not([aria-hidden])': {
            minHeight: '4rem',
        },
        '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
        },
        '& .MuiSelect-icon': {
            fontSize: controlIconSizes[size],
        },
    };
};

/**
 * Component overrides shared verbatim by the light and dark themes.
 * Spread FIRST in each theme's `components` object — keys also defined
 * by a theme (MuiButton, MuiTab, …) intentionally win over this fragment
 * and merge the exported pieces above instead.
 */
export const controlOverrides: Components<Theme> = {
    // No ripple anywhere. Ripple doubled as the keyboard-focus indicator,
    // so restore a visible outline for focus-visible.
    MuiButtonBase: {
        defaultProps: {
            disableRipple: true,
        },
        styleOverrides: {
            root: ({ theme }) => ({
                '&.Mui-focusVisible': {
                    outlineStyle: 'solid',
                    outlineWidth: 2,
                    outlineOffset: 2,
                    outlineColor: theme.palette.primary.main,
                },
            }),
        },
    },

    // Unsized fields keep today's visual weight (old `small` ≈ new `large`).
    MuiTextField: {
        defaultProps: {
            size: 'large',
        },
    },

    MuiOutlinedInput: {
        styleOverrides: {
            root: ({ ownerState }) => outlinedInputSizing(ownerState),
        },
    },

    // Vertically center the value/tags in Autocompletes. MUI applies an
    // asymmetric paddingTop to its inputRoot here (outranking a rule coming
    // from MuiOutlinedInput), which leaves a single selected value sitting
    // high in the field. Override it at MUI's own injection point.
    MuiAutocomplete: {
        styleOverrides: {
            inputRoot: {
                alignItems: 'center',
                paddingTop: 0,
                paddingBottom: 0,
                // summary-style selects (no chips): keep the value + input on
                // one line instead of wrapping the input below a long value
                '&:not(:has(.MuiChip-root))': {
                    flexWrap: 'nowrap',
                },
            },
        },
    },

    MuiInputLabel: {
        styleOverrides: {
            root: ({ ownerState }) => {
                const size = sizeOf(ownerState?.size);
                const height = controlHeights[size];
                const paddingX = controlPaddingX[size];
                return {
                    // Center the resting (non-floating) label in the shorter
                    // field. ~20px is the label line height at these font sizes.
                    '&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
                        fontSize: controlFontSizes[size],
                        transform: `translate(${paddingX}px, ${Math.round((height - 20) / 2)}px) scale(1)`,
                    },
                };
            },
        },
    },
};
