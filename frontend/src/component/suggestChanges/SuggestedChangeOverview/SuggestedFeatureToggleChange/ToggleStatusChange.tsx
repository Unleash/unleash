import { Box } from '@mui/material';
import { FC } from 'react';
import { PlaygroundResultChip } from 'component/playground/Playground/PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip';

export const ToggleStatusChange: FC<{ enabled: boolean }> = ({ enabled }) => {
    return (
        <Box sx={{ p: 1 }}>
            New status:{' '}
            <PlaygroundResultChip
                showIcon={false}
                label={enabled ? ' Enabled' : 'Disabled'}
                enabled={enabled}
            />
        </Box>
    );
};
