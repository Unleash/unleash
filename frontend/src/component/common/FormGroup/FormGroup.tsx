import { styled } from '@mui/material';

/**
 * A bordered, slightly elevated container that visually groups related form
 * controls (e.g. a repeatable "add value" block with its inputs, action button
 * and the resulting items). Wrap `FormField`s and their output inside it.
 */
export const FormGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.elevation1,
    // Spacing between members is owned by `gap`; drop members' own bottom
    // margins (e.g. FormField's) so it isn't doubled up. Doubled selector
    // raises specificity above the child's own rule.
    '&& > *': {
        marginBottom: 0,
    },
}));
