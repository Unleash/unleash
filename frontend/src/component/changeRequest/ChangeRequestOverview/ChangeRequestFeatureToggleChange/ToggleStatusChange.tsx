import { VFC } from 'react';
import { Link, Box } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Badge } from 'component/common/Badge/Badge';

interface IPlaygroundResultsTable {
    enabled: boolean;
    onDiscard?: () => void;
}

export const ToggleStatusChange: VFC<IPlaygroundResultsTable> = ({
    enabled,
    onDiscard,
}) => {
    return (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
                New status:{' '}
                <Badge color={enabled ? 'success' : 'error'}>
                    {enabled ? ' Enabled' : 'Disabled'}
                </Badge>
            </Box>
            <ConditionallyRender
                condition={Boolean(onDiscard)}
                show={
                    <Box>
                        <Link onClick={onDiscard}>Discard</Link>
                    </Box>
                }
            />
        </Box>
    );
};
