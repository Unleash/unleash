import { VFC } from 'react';
import { ISuggestChange } from 'interfaces/suggestChangeset';
import { Box } from '@mui/system';
import { PlaygroundResultChip } from 'component/playground/Playground/PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip'; // FIXME: refactor - extract to common

export const ChangeItem: VFC<ISuggestChange> = ({ action, id, payload }) => {
    if (action === 'updateEnabled') {
        return (
            <Box key={id}>
                New status:{' '}
                <PlaygroundResultChip
                    showIcon={false}
                    label={payload ? 'Enabled' : 'Disabled'}
                    enabled={Boolean(payload)}
                />
            </Box>
        );
    }
    return <Box key={id}>Change with ID: {id}</Box>;
};
