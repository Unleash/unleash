import type { FC, ReactNode } from 'react';
import { Box } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { ChangeItemWrapper as LegacyChangeItemWrapper } from './LegacyStrategyChange.tsx';
import { Action, ChangeItemInfo, ChangeItemWrapper } from './Change.styles';

interface IToggleStatusChange {
    enabled: boolean;
    actions?: ReactNode;
}

/**
 * @deprecated use ToggleStatusChange instead; remove with flag crDiffView
 */
export const LegacyToggleStatusChange: FC<IToggleStatusChange> = ({
    enabled,
    actions,
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
            {actions}
        </LegacyChangeItemWrapper>
    );
};

export const ToggleStatusChange: FC<IToggleStatusChange> = ({
    enabled,
    actions,
}) => {
    return (
        <ChangeItemWrapper>
            <ChangeItemInfo>
                <Action>New status</Action>
                <Badge color={enabled ? 'success' : 'error'}>
                    {enabled ? ' Enabled' : 'Disabled'}
                </Badge>
                {actions}
            </ChangeItemInfo>
        </ChangeItemWrapper>
    );
};
