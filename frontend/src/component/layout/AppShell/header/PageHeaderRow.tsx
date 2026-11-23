import type { FC } from 'react';
import { styled } from '@mui/material';
import { PageBreadcrumbs } from './PageBreadcrumbs.tsx';

const StyledRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    height: theme.spacing(6),
}));

export const PageHeaderRow: FC = () => (
    <StyledRow>
        <PageBreadcrumbs />
    </StyledRow>
);
