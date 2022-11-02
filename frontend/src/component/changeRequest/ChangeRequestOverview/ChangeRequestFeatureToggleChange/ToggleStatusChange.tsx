import { VFC } from 'react';
import { Link, Box, Typography } from '@mui/material';
import { PlaygroundResultChip } from 'component/playground/Playground/PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip';
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
                <PlaygroundResultChip
                    showIcon={false}
                    label={enabled ? ' Enabled' : 'Disabled'}
                    enabled={enabled}
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
