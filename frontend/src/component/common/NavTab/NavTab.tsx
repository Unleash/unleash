import { Tab, type TabProps } from '@mui/material';
import { SteadyWidthText } from 'component/common/SteadyWidthText/SteadyWidthText';

/**
 * The single tab used for page-level navigation across the app. Carries no
 * bespoke styling — all sizing/spacing/color/weight comes from the MUI theme
 * (`MuiTab`/`MuiTabs`), so every tab row looks and behaves identically.
 *
 * String labels are wrapped in SteadyWidthText so the active-tab bold weight
 * never shifts the layout. Non-string labels (with badges/icons/counts) are
 * passed through untouched.
 *
 * Use this instead of `styled(Tab)`; do not re-add per-page tab styling.
 */
export const NavTab = ({ label, ...props }: TabProps) => (
    <Tab
        {...props}
        label={
            typeof label === 'string' ? (
                <SteadyWidthText>{label}</SteadyWidthText>
            ) : (
                label
            )
        }
    />
);
