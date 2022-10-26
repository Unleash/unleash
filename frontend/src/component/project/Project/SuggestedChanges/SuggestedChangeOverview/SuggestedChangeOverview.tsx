import { FC } from 'react';
import { Box } from '@mui/material';
import { useSuggestedChange } from 'hooks/api/getters/useSuggestChange/useSuggestedChange';
import { SuggestedChangeHeader } from './SuggestedChangeHeader/SuggestedChangeHeader';
import { SuggestedChangeTimeline } from './SuggestedChangeTimeline/SuggestedChangeTimeline';
import { SuggestedChangeReviewers } from './SuggestedChangeReviewers/SuggestedChangeReviewers';
import { SuggestedChangeSet } from './SuggestedChangeSet/SuggestedChangeSet';

export const SuggestedChangeOverview: FC = () => {
    const { data: suggestedChange } = useSuggestedChange();

    return (
        <>
            <SuggestedChangeHeader suggestedChange={suggestedChange} />
            <Box sx={{ display: 'flex' }}>
                <Box
                    sx={{
                        width: '30%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <SuggestedChangeTimeline />
                    <SuggestedChangeReviewers />
                </Box>

                <SuggestedChangeSet suggestedChange={suggestedChange} />
            </Box>
        </>
    );
};
