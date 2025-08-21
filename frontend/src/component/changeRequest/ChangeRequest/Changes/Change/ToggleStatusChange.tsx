import type { FC, ReactNode } from 'react';
import { Typography } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { Action, ChangeItemInfo, ChangeItemWrapper } from './Change.styles';

interface IToggleStatusChange {
    enabled: boolean;
    actions?: ReactNode;
    isDefaultChange?: boolean;
}

const StatusWillChange = () => (
    <Typography variant='body2' component='span' color='text.secondary'>
        Feature status will change
    </Typography>
);

export const ToggleStatusChange: FC<IToggleStatusChange> = ({
    enabled,
    actions,
    isDefaultChange,
}) => {
    return (
        <ChangeItemWrapper>
            <ChangeItemInfo>
                <Action>New status</Action>
                <Badge color={enabled ? 'success' : 'error'}>
                    {enabled ? ' Enabled' : 'Disabled'}
                </Badge>
                {isDefaultChange ? <StatusWillChange /> : null}
                {actions}
            </ChangeItemInfo>
        </ChangeItemWrapper>
    );
};
