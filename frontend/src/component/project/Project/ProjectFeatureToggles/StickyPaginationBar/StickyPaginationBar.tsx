import { type ComponentProps, type FC } from 'react';
import { PaginationBar } from 'component/common/PaginationBar/PaginationBar';
import { Box, styled } from '@mui/material';

const StyledStickyBar = styled('div')(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    marginLeft: theme.spacing(2),
    zIndex: theme.zIndex.mobileStepper,
    borderBottomLeftRadius: theme.shape.borderRadiusMedium,
    borderBottomRightRadius: theme.shape.borderRadiusMedium,
    borderTop: `1px solid ${theme.palette.divider}`,
    boxShadow: `0px -2px 8px 0px rgba(32, 32, 33, 0.06)`,
    height: '52px',
}));

const StyledStickyBarContentContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    minWidth: 0,
}));

export const StickyPaginationBar: FC<ComponentProps<typeof PaginationBar>> = ({
    ...props
}) => {
    return (
        <StyledStickyBar>
            <StyledStickyBarContentContainer>
                <PaginationBar {...props} />
            </StyledStickyBarContentContainer>
        </StyledStickyBar>
    );
};
