import type { FC, ReactNode } from 'react';
import { ChangeItemInfo, ChangeItemWrapper } from './Change.styles.tsx';
import { styled } from '@mui/material';

const ArchiveBox = styled('span')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.error.main,
}));

interface IArchiveFeatureChange {
    actions?: ReactNode;
}

export const LegacyArchiveFeatureChange: FC<IArchiveFeatureChange> = ({
    actions,
}) => (
    <ChangeItemWrapper>
        <ChangeItemInfo>
            <ArchiveBox>Archiving flag</ArchiveBox>
            {actions}
        </ChangeItemInfo>
    </ChangeItemWrapper>
);

export const ArchiveFeatureChange: FC<IArchiveFeatureChange> = ({
    actions,
}) => (
    <ChangeItemWrapper>
        <ArchiveBox>Archiving flag</ArchiveBox>
        {actions}
    </ChangeItemWrapper>
);
