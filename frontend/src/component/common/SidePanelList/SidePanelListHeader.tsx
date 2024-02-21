import { styled } from '@mui/material';
import { ReactNode } from 'react';

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.table.headerBackground,
}));

const StyledHeaderHalf = styled('div')(({ theme }) => ({
    display: 'flex',
    flex: 1,
}));

interface ISidePanelListHeaderProps {
    sidePanelHeader: string;
    children: ReactNode[];
}

export const SidePanelListHeader = ({
    sidePanelHeader,
    children,
}: ISidePanelListHeaderProps) => (
    <StyledHeader>
        <StyledHeaderHalf>{children}</StyledHeaderHalf>
        <StyledHeaderHalf>{sidePanelHeader}</StyledHeaderHalf>
    </StyledHeader>
);
