import type { FC, ReactNode } from 'react';
import { Action, ChangeItemInfo, ChangeItemWrapper } from './Change.styles.tsx';

type ArchiveFeatureChange = {
    actions?: ReactNode;
};

export const ArchiveFeatureChange: FC<ArchiveFeatureChange> = ({ actions }) => (
    <ChangeItemWrapper>
        <ChangeItemInfo>
            <Action color='error.main'>Archiving flag</Action>
            {actions}
        </ChangeItemInfo>
    </ChangeItemWrapper>
);
