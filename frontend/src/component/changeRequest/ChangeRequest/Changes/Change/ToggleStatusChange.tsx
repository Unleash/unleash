import type { FC, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { ChangeItemWrapper as LegacyChangeItemWrapper } from './LegacyStrategyChange.tsx';
import { Action, ChangeItemInfo, ChangeItemWrapper } from './Change.styles';

interface IToggleStatusChange {
    enabled: boolean;
    actions?: ReactNode;
    isDefaultChange?: boolean;
}

const StatusWillChange = () => (
    <Typography
        variant='body2'
        component='span'
        color='text.secondary'
        sx={{ marginLeft: 'auto' }}
    >
        Feature status will change
    </Typography>
);

/**
 * @deprecated use ToggleStatusChange instead; remove with flag crDiffView
 */
export const LegacyToggleStatusChange: FC<IToggleStatusChange> = ({
    enabled,
    actions,
    isDefaultChange,
}) => {
    return (
        <LegacyChangeItemWrapper>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                New status
                <Badge
                    sx={(theme) => ({ marginLeft: theme.spacing(1) })}
                    color={enabled ? 'success' : 'error'}
                >
                    {enabled ? ' Enabled' : 'Disabled'}
                </Badge>
            </Box>
            {isDefaultChange ? <StatusWillChange /> : null}
            {actions}
        </LegacyChangeItemWrapper>
    );
};

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
