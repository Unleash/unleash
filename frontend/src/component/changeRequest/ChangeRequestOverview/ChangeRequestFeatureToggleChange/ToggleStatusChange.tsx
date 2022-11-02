import { VFC } from 'react';
import { Link, Box } from '@mui/material';
import { StatusChip } from 'component/common/StatusChip/StatusChip';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

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
                <StatusChip
                    label={enabled ? ' Enabled' : 'Disabled'}
                    variant={enabled ? 'true' : 'false'}
                />
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
