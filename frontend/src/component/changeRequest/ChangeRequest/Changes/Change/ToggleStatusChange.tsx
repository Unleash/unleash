import type { FC, ReactNode } from 'react';
import { Badge } from 'component/common/Badge/Badge';
import { ChangeItemInfo, ChangeItemWrapper } from './Change.styles';

interface IToggleStatusChange {
    enabled: boolean;
    actions?: ReactNode;
}

export const ToggleStatusChange: FC<IToggleStatusChange> = ({
    enabled,
    actions,
}) => {
    return (
        <ChangeItemWrapper>
            <ChangeItemInfo>
                New status
                <Badge color={enabled ? 'success' : 'error'}>
                    {enabled ? ' Enabled' : 'Disabled'}
                </Badge>
                {actions}
            </ChangeItemInfo>
        </ChangeItemWrapper>
    );
};
