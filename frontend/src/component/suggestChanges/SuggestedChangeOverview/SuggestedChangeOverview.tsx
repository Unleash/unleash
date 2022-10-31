import { FC } from 'react';
import { Box, Paper } from '@mui/material';
import { useSuggestedChange } from 'hooks/api/getters/useSuggestChange/useSuggestedChange';
import { SuggestedChangeHeader } from './SuggestedChangeHeader/SuggestedChangeHeader';
import { SuggestedChangeTimeline } from './SuggestedChangeTimeline/SuggestedChangeTimeline';
import { SuggestedChangeReviewers } from './SuggestedChangeReviewers/SuggestedChangeReviewers';
import { SuggestedChangeset } from '../SuggestedChangeset/SuggestedChangeset';

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
                <Paper
                    elevation={0}
                    sx={theme => ({
                        marginTop: theme.spacing(2),
                        marginLeft: theme.spacing(2),
                        width: '70%',
                        padding: 2,
                        borderRadius: theme =>
                            `${theme.shape.borderRadiusLarge}px`,
                    })}
                >
                    <Box
                        sx={theme => ({
                            padding: theme.spacing(2),
                        })}
                    >
                        <SuggestedChangeset suggestedChange={suggestedChange} />
                    </Box>
                </Paper>
            </Box>
        </>
    );
};
