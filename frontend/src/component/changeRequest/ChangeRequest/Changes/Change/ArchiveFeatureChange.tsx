import type { FC, ReactNode } from 'react';
import {
    ChangeItemInfo,
    ChangeItemWrapper,
    LegacyChangeItemWrapper,
} from './Change.styles.tsx';
import { styled } from '@mui/material';

type ArchiveFeatureChange = {
    actions?: ReactNode;
};

const ArchiveBox = styled('span')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.error.main,
}));

/**
 * Deprecated: use ArchiveFeatureChange instead; remove with flag crDiffView
 * @deprecated
 */
export const LegacyArchiveFeatureChange: FC<ArchiveFeatureChange> = ({
    actions,
}) => (
    <LegacyChangeItemWrapper>
        <ChangeItemInfo>
            <ArchiveBox>Archiving flag</ArchiveBox>
            {actions}
        </ChangeItemInfo>
    </LegacyChangeItemWrapper>
);

export const ArchiveFeatureChange: FC<ArchiveFeatureChange> = ({ actions }) => (
    <ChangeItemWrapper>
        <ArchiveBox>Archiving flag</ArchiveBox>
        {actions}
    </ChangeItemWrapper>
);
