import { IconButton, Tooltip } from '@mui/material';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';

interface IQuickTourButtonProps {
    onOpen: () => void;
}

/**
 * A launcher in the top bar (next to Help & resources) that opens the 4-step
 * "quick tour" of feature flags. The `open` state and the dialog itself live
 * one level up (in Header) because Header switches between two JSX branches
 * across the `lg` breakpoint - if the button owned the state, that switch
 * would unmount it and close the tour mid-resize.
 */
export const QuickTourButton = ({ onOpen }: IQuickTourButtonProps) => (
    <Tooltip title='Quick tour' arrow>
        <IconButton
            size='large'
            onClick={onOpen}
            data-testid='QUICK_TOUR_BUTTON'
        >
            <ExploreOutlinedIcon />
        </IconButton>
    </Tooltip>
);
