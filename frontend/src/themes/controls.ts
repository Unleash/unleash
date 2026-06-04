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

export const controlHeights = scales.compact;

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
export const buttonSizes = {
    sizeSmall: {
        height: controlHeights.small,
        padding: `0 ${controlPaddingX.small + 2}px`,
        fontSize: controlFontSizes.small,
    },
    sizeMedium: {
        height: controlHeights.medium,
        padding: `0 ${controlPaddingX.medium + 2}px`,
        fontSize: controlFontSizes.medium,
    },
    sizeLarge: {
        height: controlHeights.large,
        padding: `0 ${controlPaddingX.large + 4}px`,
        fontSize: controlFontSizes.large,
    },
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
 * Secondary (outlined) buttons: subtle gray instead of the purple
 * outline, so they pull less focus and sit well in groups.
 * Spread into the `MuiButton.styleOverrides.root` object in both themes.
 */
export const subtleOutlinedButton = (theme: Theme) => ({
    '&.MuiButton-outlined.MuiButton-colorPrimary': {
        color: theme.palette.text.primary,
        borderColor: theme.palette.neutral.border,
        '&:hover': {
            borderColor: theme.palette.neutral.main,
            backgroundColor: theme.palette.action.hover,
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
        },
        '&:not(.MuiInputBase-multiline) .MuiOutlinedInput-input': {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: paddingX,
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
