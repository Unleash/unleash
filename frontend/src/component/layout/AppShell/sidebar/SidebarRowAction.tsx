import type { FC, ReactNode } from 'react';
import { ButtonBase, styled, Tooltip } from '@mui/material';

const ICON_SIZE = 2;
const PADDING = 0.375;

export const SIDEBAR_ROW_ACTION_SIZE = ICON_SIZE + 2 * PADDING;

const StyledButton = styled(ButtonBase)(({ theme }) => ({
    padding: theme.spacing(PADDING),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.secondary,
    '& svg': {
        fontSize: theme.spacing(ICON_SIZE),
    },
    '&:hover': {
        backgroundColor: theme.palette.action.selected,
        color: theme.palette.text.primary,
    },
    '&.Mui-focusVisible, &:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
}));

export const SidebarRowAction: FC<{
    tooltip: string;
    label: string;
    icon: ReactNode;
    onClick: () => void;
}> = ({ tooltip, label, icon, onClick }) => (
    <Tooltip title={tooltip} arrow>
        <StyledButton aria-label={label} onClick={onClick}>
            {icon}
        </StyledButton>
    </Tooltip>
);
