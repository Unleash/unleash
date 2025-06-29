import type { FC, ReactNode } from 'react';
import { Box, styled } from '@mui/material';
import { ChangeItemWrapper } from './StrategyChange.tsx';

const ArchiveBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.error.main,
}));

interface IArchiveFeatureChange {
    actions?: ReactNode;
}

export const ArchiveFeatureChange: FC<IArchiveFeatureChange> = ({
    actions,
}) => (
    <ChangeItemWrapper>
        <ArchiveBox>Archiving flag</ArchiveBox>
        {actions}
    </ChangeItemWrapper>
);
