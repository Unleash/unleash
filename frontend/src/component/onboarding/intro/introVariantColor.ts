import { darken, getContrastRatio } from '@mui/material/styles';

const WHITE = '#fff';
const MINIMUM_TEXT_CONTRAST = 4.5;

/**
 * Variant accents are also used as filled controls in the intro. Preserve each
 * hue while darkening only as much as needed for consistent, readable white
 * labels in either theme.
 */
export const getVariantSolidFill = (color: string): string => {
    let fill = color;

    for (
        let step = 0;
        step < 6 && getContrastRatio(fill, WHITE) < MINIMUM_TEXT_CONTRAST;
        step += 1
    ) {
        fill = darken(fill, 0.08);
    }

    return fill;
};
