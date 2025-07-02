import type { FC, ReactNode } from 'react';
import { Box, styled } from '@mui/material';
import { ChangeItemInfo, ChangeItemWrapper } from './Change.styles.tsx';

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
        <ChangeItemInfo>
            <ArchiveBox>Archiving flag</ArchiveBox>
            {actions}
        </ChangeItemInfo>
    </ChangeItemWrapper>
);
