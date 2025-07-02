import type { FC, ReactNode } from 'react';
import { Box } from '@mui/material';
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
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    New status
                    <Badge
                        sx={(theme) => ({ marginLeft: theme.spacing(1) })}
                        color={enabled ? 'success' : 'error'}
                    >
                        {enabled ? ' Enabled' : 'Disabled'}
                    </Badge>
                </Box>
            </ChangeItemInfo>
            {actions}
        </ChangeItemWrapper>
    );
};
