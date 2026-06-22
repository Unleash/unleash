import type { Components, Theme } from '@mui/material/styles';
import { focusOutline } from './themeStyles';

/**
 * Design system v2 — shared sizing and behavior for controls
 * (buttons, icon buttons, inputs, selects).
 *
 * Buttons, inputs and selects share one height scale so they line up
 * when placed next to each other.
 *
 * Pixel dimensions are plain numbers (MUI/emotion render a unitless value as
 * px); only font sizes are strings, because they're `rem`.
 */
export const controlHeights = { small: 24, medium: 30, large: 36 } as const;

type ControlSize = keyof typeof controlHeights;

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

const controlIconSizes: Record<ControlSize, number> = {
    small: 16,
    medium: 20,
    large: 24,
};

/**
 * Button size definitions. Spread into `MuiButton.styleOverrides`
 * (next to `root`) in both themes.
 *
 * Note: before v2, unsized buttons fell back to MUI's default `medium`
 * (~36px), so the theme sets `defaultProps.size = 'large'` — which is 36px on
 * the new scale — to preserve their weight. Buttons that were explicitly
 * `size="small"` (~30px in MUI) were migrated to `size="medium"` at the call
 * sites — `small` here is a genuine 24px step, not a remap target.
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
    // Selector mirrors MUI's own start/end-icon target (the icon is the first
    // child of the icon span), so it works for any icon element, not just svg.
    '& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)':
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
 * Size-agnostic root styling for icon buttons. Gives them the same square,
 * rounded-corner shape as regular buttons (MUI's default icon button is a
 * circle). Spread into each theme's `MuiIconButton.styleOverrides.root`.
 *
 * Kept separate from `iconButtonSizes` because the radius is shape, not size —
 * it's constant across small/medium/large, mirroring how `buttonSizes` stays
 * purely about box/glyph dimensions.
 */
export const iconButtonRoot = (theme: Theme) => ({
    borderRadius: theme.shape.borderRadius,
    // Plain (default-color) icon buttons rest at the muted `action.active` gray;
    // on hover, darken the glyph toward the primary text color for a clearer
    // affordance. Scoped to default-color buttons via `:not([class*=color])` so
    // `color="primary"`/`"inherit"` buttons keep their own color — MUI only
    // emits a `MuiIconButton-color*` class when color isn't the default.
    '&:hover:not([class*="MuiIconButton-color"])': {
        color: theme.palette.text.primary,
    },
});

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
        // the primary-colored text above out-specifies MUI's disabled color,
        // so restore the disabled text color explicitly
        '&.Mui-disabled': {
            color: theme.palette.text.disabled,
        },
    },
});

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
                '&.Mui-focusVisible': focusOutline(theme),
            }),
        },
    },
};
