import { lazy, Suspense, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import { useUiFlag } from 'hooks/useUiFlag.ts';

// Lazy so the demo (and react-confetti) stay out of the always-loaded header
// chunk and are only fetched when the tour is opened.
const QuickTourDialog = lazy(() =>
    import('./QuickTourDialog.tsx').then((m) => ({
        default: m.QuickTourDialog,
    })),
);

/**
 * A launcher in the top bar (next to Help & resources) that opens the 4-step
 * "quick tour" of feature flags as a dialog floating over the app.
 */
export const QuickTourButton = () => {
    const enabled = useUiFlag('onboardingClosedDemo');
    const [open, setOpen] = useState(false);

    if (!enabled) {
        return null;
    }

    return (
        <>
            <Tooltip title='Quick tour' arrow>
                <IconButton
                    size='large'
                    onClick={() => setOpen(true)}
                    data-testid='QUICK_TOUR_BUTTON'
                >
                    <ExploreOutlinedIcon />
                </IconButton>
            </Tooltip>
            {open && (
                <Suspense fallback={null}>
                    <QuickTourDialog onClose={() => setOpen(false)} />
                </Suspense>
            )}
        </>
    );
};
