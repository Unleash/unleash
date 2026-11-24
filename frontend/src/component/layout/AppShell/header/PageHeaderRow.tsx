import type { FC } from 'react';
import { IconButton, styled } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { PageBreadcrumbs } from './PageBreadcrumbs.tsx';

const StyledRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    height: theme.spacing(6),
}));

// Cancels the IconButton padding so the icon lines up with the page content below.
const StyledMenuButton = styled(IconButton)(({ theme }) => ({
    marginLeft: theme.spacing(-1),
}));

export const PageHeaderRow: FC<{ onOpenNavigation?: () => void }> = ({
    onOpenNavigation,
}) => (
    <StyledRow>
        {onOpenNavigation ? (
            <StyledMenuButton
                aria-label='Open navigation'
                onClick={onOpenNavigation}
            >
                <MenuIcon />
            </StyledMenuButton>
        ) : null}
        <PageBreadcrumbs />
    </StyledRow>
);
