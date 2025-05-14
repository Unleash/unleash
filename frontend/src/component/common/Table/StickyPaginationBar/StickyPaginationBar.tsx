import { Box, styled } from '@mui/material';
import { PaginationBar } from '../PaginationBar/PaginationBar.tsx';
import type { ComponentProps, FC } from 'react';

const StyledStickyBar = styled('div')(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1.5, 2),
    zIndex: theme.zIndex.fab,
    borderBottomLeftRadius: theme.shape.borderRadiusMedium,
    borderBottomRightRadius: theme.shape.borderRadiusMedium,
    borderTop: `1px solid ${theme.palette.divider}`,
    boxShadow: `0px -2px 8px 0px rgba(32, 32, 33, 0.06)`,
}));

const StyledStickyBarContentContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    minWidth: 0,
}));

export const StickyPaginationBar: FC<ComponentProps<typeof PaginationBar>> = ({
    ...props
}) => (
    <StyledStickyBar>
        <StyledStickyBarContentContainer>
            <PaginationBar {...props} />
        </StyledStickyBarContentContainer>
    </StyledStickyBar>
);
