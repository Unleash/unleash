import { Button, styled } from '@mui/material';
import type { ReactNode } from 'react';

const StyledItemRow = styled('div')(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledItem = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ theme, selected }) => ({
    '&.MuiButton-root': {
        width: '100%',
        backgroundColor: selected
            ? theme.palette.secondary.light
            : 'transparent',
        borderRight: `${theme.spacing(0.5)} solid ${
            selected ? theme.palette.background.alternative : 'transparent'
        }`,
        padding: 0,
        borderRadius: 0,
        justifyContent: 'start',
        transition: 'background-color 0.2s ease',
        color: theme.palette.text.primary,
        textAlign: 'left',
        fontWeight: selected ? theme.fontWeight.bold : theme.fontWeight.medium,
        fontSize: theme.fontSizes.smallBody,
        overflow: 'auto',
    },
    '&:hover': {
        backgroundColor: selected
            ? theme.palette.secondary.light
            : theme.palette.neutral.light,
    },
    '&.Mui-disabled': {
        pointerEvents: 'auto',
    },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
    },
}));

interface ISidePanelListItemProps {
    selected: boolean;
    onClick: () => void;
    children: ReactNode;
}

export const SidePanelListItem = ({
    selected,
    onClick,
    children,
}: ISidePanelListItemProps) => (
    <StyledItemRow>
        <StyledItem selected={selected} onClick={onClick}>
            {children}
        </StyledItem>
    </StyledItemRow>
);
