import { ReactNode, VFC } from 'react';
import { Box } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { ChangeItemWrapper } from './StrategyChange';

interface IToggleStatusChange {
    enabled: boolean;
    discard?: ReactNode;
}

export const ToggleStatusChange: VFC<IToggleStatusChange> = ({
    enabled,
    discard,
}) => {
    return (
        <ChangeItemWrapper>
            <Box>
                New status:{' '}
                <Badge color={enabled ? 'success' : 'error'}>
                    {enabled ? ' Enabled' : 'Disabled'}
                </Badge>
            </Box>
            {discard}
        </ChangeItemWrapper>
    );
};
