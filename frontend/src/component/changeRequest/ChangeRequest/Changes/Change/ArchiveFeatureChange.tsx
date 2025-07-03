import type { FC, ReactNode } from 'react';
import { Action, ChangeItemInfo, ChangeItemWrapper } from './Change.styles.tsx';
import { styled } from '@mui/material';
import { ChangeItemWrapper as LegacyChangeItemWrapper } from './LegacyStrategyChange.tsx';

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
        <Action color='error.main'>Archiving flag</Action>
        {actions}
    </ChangeItemWrapper>
);
